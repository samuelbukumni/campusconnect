import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PartnersService } from '../services/partners.service';
import { PartnersRepository } from '../repositories/partners.repository';
import { CoursesRepository } from '../../courses/repositories/courses.repository';
import { MatchStatus } from '../entities/study-partner-match.entity';

describe('PartnersService', () => {
  let service: PartnersService;
  let partnersRepo: any;
  let coursesRepo: any;

  beforeEach(async () => {
    partnersRepo = {
      createMatch: jest.fn(),
      findById: jest.fn(),
      findUserMatches: jest.fn(),
      updateStatus: jest.fn(),
      findEligibleCandidate: jest.fn(),
    };

    coursesRepo = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnersService,
        { provide: PartnersRepository, useValue: partnersRepo },
        { provide: CoursesRepository, useValue: coursesRepo },
      ],
    }).compile();

    service = module.get<PartnersService>(PartnersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('matchPartner', () => {
    it('should throw NotFoundException if course does not exist', async () => {
      coursesRepo.findById.mockResolvedValue(null);

      await expect(
        service.matchPartner('student-1', { courseId: 'c1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if no eligible candidate found', async () => {
      coursesRepo.findById.mockResolvedValue({ id: 'c1' });
      partnersRepo.findEligibleCandidate.mockResolvedValue(null);

      await expect(
        service.matchPartner('student-1', { courseId: 'c1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create match successfully when candidate is found', async () => {
      coursesRepo.findById.mockResolvedValue({ id: 'c1' });
      partnersRepo.findEligibleCandidate.mockResolvedValue({ id: 'student-2' });
      partnersRepo.createMatch.mockResolvedValue({ id: 'm1' });
      partnersRepo.findById.mockResolvedValue({
        id: 'm1',
        studentAId: 'student-1',
        studentBId: 'student-2',
        courseId: 'c1',
      });

      const result = await service.matchPartner('student-1', { courseId: 'c1' });
      expect(result.id).toBe('m1');
      expect(partnersRepo.createMatch).toHaveBeenCalledWith(
        'student-1',
        'student-2',
        'c1',
        undefined,
        undefined,
      );
    });
  });

  describe('reshufflePartner', () => {
    it('should throw ForbiddenException if user is not in match', async () => {
      partnersRepo.findById.mockResolvedValue({
        id: 'm1',
        studentAId: 'user-a',
        studentBId: 'user-b',
        status: MatchStatus.ACTIVE,
      });

      await expect(
        service.reshufflePartner('intruder-user', 'm1', {}),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if match is not active', async () => {
      partnersRepo.findById.mockResolvedValue({
        id: 'm1',
        studentAId: 'user-a',
        studentBId: 'user-b',
        status: MatchStatus.RESHUFFLED,
      });

      await expect(
        service.reshufflePartner('user-a', 'm1', {}),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
