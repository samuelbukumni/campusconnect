import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { Topic } from '../entities/topic.entity';
import { CreateCourseDto } from '../dto/create-course.dto';
import { CreateTopicDto } from '../dto/create-topic.dto';

@Injectable()
export class CoursesRepository {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Topic)
    private readonly topicRepo: Repository<Topic>,
  ) {}

  async createCourse(dto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepo.create({
      ...dto,
      code: dto.code.toUpperCase().trim(),
    });
    return this.courseRepo.save(course);
  }

  async findByCode(code: string): Promise<Course | null> {
    return this.courseRepo.findOne({
      where: { code: code.toUpperCase().trim() },
      relations: ['topics'],
    });
  }

  async findById(id: string): Promise<Course | null> {
    return this.courseRepo.findOne({
      where: { id },
      relations: ['topics'],
    });
  }

  async findAll(options?: { department?: string; level?: string }): Promise<Course[]> {
    const qb = this.courseRepo.createQueryBuilder('course')
      .leftJoinAndSelect('course.topics', 'topics');

    if (options?.department) {
      qb.andWhere('LOWER(course.department) = LOWER(:department)', {
        department: options.department,
      });
    }

    if (options?.level) {
      qb.andWhere('course.level = :level', { level: options.level });
    }

    return qb.orderBy('course.code', 'ASC').getMany();
  }

  async search(searchTerm: string): Promise<Course[]> {
    const term = `%${searchTerm.toLowerCase().trim()}%`;

    return this.courseRepo.createQueryBuilder('course')
      .leftJoinAndSelect('course.topics', 'topics')
      .where('LOWER(course.code) LIKE :term', { term })
      .orWhere('LOWER(course.title) LIKE :term', { term })
      .orWhere('LOWER(topics.title) LIKE :term', { term })
      .orderBy('course.code', 'ASC')
      .getMany();
  }

  async addTopic(courseId: string, dto: CreateTopicDto): Promise<Topic> {
    const topic = this.topicRepo.create({
      ...dto,
      courseId,
    });
    return this.topicRepo.save(topic);
  }

  async countCourses(): Promise<number> {
    return this.courseRepo.count();
  }
}
