import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CoursesRepository } from '../repositories/courses.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { CreateCourseDto } from '../dto/create-course.dto';
import { CreateTopicDto } from '../dto/create-topic.dto';
import { QueryCoursesDto } from '../dto/query-courses.dto';
import { Course } from '../entities/course.entity';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    private readonly coursesRepository: CoursesRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const existing = await this.coursesRepository.findByCode(createCourseDto.code);
    if (existing) {
      throw new ConflictException(`Course with code "${createCourseDto.code}" already exists`);
    }

    return this.coursesRepository.createCourse(createCourseDto);
  }

  async findAll(query: QueryCoursesDto) {
    let courses: Course[];

    if (query.q && query.q.trim().length > 0) {
      courses = await this.coursesRepository.search(query.q);
    } else {
      courses = await this.coursesRepository.findAll({
        department: query.department,
        level: query.level,
      });
    }

    // Enrich courses with live demand & tutor availability stats
    return Promise.all(
      courses.map(async (course) => {
        const tutors = await this.usersRepository.findAll({
          courseToTeach: course.code,
        });

        const learners = await this.usersRepository.findAll({
          courseNeedingHelp: course.code,
        });

        return {
          ...course,
          availableTutorsCount: tutors.length,
          learnersSeekingHelpCount: learners.length,
        };
      }),
    );
  }

  async findById(id: string) {
    const course = await this.coursesRepository.findById(id);
    if (!course) {
      throw new NotFoundException(`Course not found`);
    }

    // Get list of verified student tutors for this course
    const tutors = await this.usersRepository.findAll({
      courseToTeach: course.code,
    });

    const learners = await this.usersRepository.findAll({
      courseNeedingHelp: course.code,
    });

    const sanitizedTutors = tutors.map((tutor) => ({
      id: tutor.id,
      name: `${tutor.firstName} ${tutor.lastName}`,
      department: tutor.department,
      level: tutor.level,
      rating: tutor.rating,
      reviewCount: tutor.reviewCount,
      bio: tutor.bio,
      avatarUrl: tutor.avatarUrl,
    }));

    return {
      course,
      availableTutorsCount: tutors.length,
      learnersSeekingHelpCount: learners.length,
      availableTutors: sanitizedTutors,
    };
  }

  async addTopic(courseId: string, createTopicDto: CreateTopicDto) {
    const course = await this.coursesRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course not found`);
    }

    return this.coursesRepository.addTopic(courseId, createTopicDto);
  }

  async seedDefaultCourses() {
    const existingCount = await this.coursesRepository.countCourses();
    if (existingCount > 0) {
      return { message: `Courses catalog already seeded (${existingCount} courses present).` };
    }

    const defaultCatalog = [
      {
        code: 'MTH 102',
        title: 'Elementary Mathematics II (Calculus)',
        department: 'Mathematics & Statistics',
        level: '100',
        description: 'Differential and integral calculus, functions, limits, integration techniques.',
        topics: ['Limits and Continuity', 'Derivatives & Applications', 'Integration by Parts', 'Definite Integrals'],
      },
      {
        code: 'CSC 201',
        title: 'Data Structures & Algorithms',
        department: 'Computer Science',
        level: '200',
        description: 'Arrays, linked lists, stacks, queues, trees, sorting and searching algorithms.',
        topics: ['Linked Lists', 'Binary Search Trees', 'Recursion & Dynamic Programming', 'Graph Traversal'],
      },
      {
        code: 'PHY 101',
        title: 'General Physics I (Mechanics & Properties of Matter)',
        department: 'Physics',
        level: '100',
        description: 'Kinematics, Newton laws of motion, gravitation, rotational dynamics.',
        topics: ['Vectors and Kinematics', 'Newtonian Dynamics', 'Work, Energy and Power', 'Fluid Mechanics'],
      },
      {
        code: 'CHM 101',
        title: 'General Chemistry I',
        department: 'Pure & Applied Chemistry',
        level: '100',
        description: 'Atomic structure, chemical bonding, stoichiometry, periodic trends.',
        topics: ['Atomic Structure', 'Chemical Bonding', 'Stoichiometry & Mole Concept', 'Thermodynamics'],
      },
      {
        code: 'EEE 301',
        title: 'Electric Circuit Theory I',
        department: 'Electrical & Electronic Engineering',
        level: '300',
        description: 'Network theorems, AC circuits, Kirchhoff laws, resonance and Laplace transforms.',
        topics: ['Thevenin and Norton Theorems', 'AC Steady-State Analysis', 'Transient Circuit Analysis'],
      },
      {
        code: 'ECO 101',
        title: 'Principles of Microeconomics',
        department: 'Economics',
        level: '100',
        description: 'Demand and supply, elasticity, consumer behavior, market structures.',
        topics: ['Demand and Supply Equilibrium', 'Price Elasticity', 'Theory of Consumer Behavior'],
      },
    ];

    for (const item of defaultCatalog) {
      const course = await this.coursesRepository.createCourse({
        code: item.code,
        title: item.title,
        department: item.department,
        level: item.level,
        description: item.description,
      });

      for (const topicTitle of item.topics) {
        await this.coursesRepository.addTopic(course.id, {
          title: topicTitle,
        });
      }
    }

    this.logger.log(`Seeded ${defaultCatalog.length} default university courses successfully.`);
    return {
      message: `Seeded ${defaultCatalog.length} sample courses and syllabus topics successfully.`,
    };
  }
}
