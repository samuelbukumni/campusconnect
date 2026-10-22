import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from '../services/courses.service';
import { CoursesRepository } from '../repositories/courses.repository';
import { UsersRepository } from '../../users/repositories/users.repository';

describe('CoursesService', () => {
  let service: CoursesService;
  let coursesRepo: Partial<Record<keyof CoursesRepository, jest.Mock>>;
  let usersRepo: Partial<Record<keyof UsersRepository, jest.Mock>>;

  beforeEach(async () => {
    coursesRepo = {
      findAll: jest.fn().mockResolvedValue([]),
      search: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      findByCode: jest.fn(),
      createCourse: jest.fn(),
      addTopic: jest.fn(),
      countCourses: jest.fn().mockResolvedValue(0),
    };

    usersRepo = {
      findAll: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: CoursesRepository, useValue: coursesRepo },
        { provide: UsersRepository, useValue: usersRepo },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list all courses with metrics', async () => {
    const mockCourse = {
      id: 'course-uuid',
      code: 'MTH 102',
      title: 'Calculus',
      department: 'Math',
      level: '100',
      topics: [],
    };

    coursesRepo.findAll.mockResolvedValue([mockCourse]);
    usersRepo.findAll.mockResolvedValue([]);

    const result = await service.findAll({});
    expect(result).toHaveLength(1);
    expect(result[0].availableTutorsCount).toEqual(0);
    expect(result[0].learnersSeekingHelpCount).toEqual(0);
  });
});
