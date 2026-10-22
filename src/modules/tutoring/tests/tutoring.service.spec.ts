import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TutoringService } from '../services/tutoring.service';
import { TutoringRepository } from '../repositories/tutoring.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { CoursesRepository } from '../../courses/repositories/courses.repository';
import { SessionType, SessionStatus } from '../entities/tutoring-session.entity';

describe('TutoringService', () => {
  let service: TutoringService;
  let tutoringRepo: any;
  let usersRepo: any;
  let coursesRepo: any;

  beforeEach(async () => {
    tutoringRepo = {
      createSession: jest.fn(),
      findById: jest.fn(),
      findUserSessions: jest.fn(),
      findOpenGroupSessions: jest.fn(),
      addParticipant: jest.fn(),
      findParticipant: jest.fn(),
      updateStatus: jest.fn(),
    };

    usersRepo = {
      findById: jest.fn(),
    };

    coursesRepo = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutoringService,
        { provide: TutoringRepository, useValue: tutoringRepo },
        { provide: UsersRepository, useValue: usersRepo },
        { provide: CoursesRepository, useValue: coursesRepo },
      ],
    }).compile();

    service = module.get<TutoringService>(TutoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bookSession', () => {
    const mockDto = {
      tutorId: 'tutor-uuid',
      courseId: 'course-uuid',
      sessionType: SessionType.ONE_ON_ONE,
      scheduledAt: '2026-10-25T14:00:00.000Z',
    };

    it('should throw BadRequestException if learner books with themselves', async () => {
      await expect(service.bookSession('tutor-uuid', mockDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if tutor does not exist', async () => {
      usersRepo.findById.mockResolvedValue(null);
      await expect(service.bookSession('learner-uuid', mockDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if course does not exist', async () => {
      usersRepo.findById.mockResolvedValue({ id: 'tutor-uuid' });
      coursesRepo.findById.mockResolvedValue(null);

      await expect(service.bookSession('learner-uuid', mockDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should successfully book session and add learner as participant', async () => {
      usersRepo.findById.mockResolvedValue({ id: 'tutor-uuid' });
      coursesRepo.findById.mockResolvedValue({ id: 'course-uuid' });
      tutoringRepo.createSession.mockResolvedValue({ id: 'session-uuid' });
      tutoringRepo.addParticipant.mockResolvedValue({});
      tutoringRepo.findById.mockResolvedValue({
        id: 'session-uuid',
        tutorId: 'tutor-uuid',
        participants: [{ learnerId: 'learner-uuid' }],
      });

      const result = await service.bookSession('learner-uuid', mockDto as any);
      expect(result.id).toBe('session-uuid');
      expect(tutoringRepo.addParticipant).toHaveBeenCalledWith(
        'session-uuid',
        'learner-uuid',
        'Initial booking request',
      );
    });
  });

  describe('joinGroupSession', () => {
    it('should throw BadRequestException if session is not group type', async () => {
      tutoringRepo.findById.mockResolvedValue({
        id: 'session-1',
        sessionType: SessionType.ONE_ON_ONE,
        status: SessionStatus.SCHEDULED,
      });

      await expect(service.joinGroupSession('learner-1', 'session-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if group session is full', async () => {
      tutoringRepo.findById.mockResolvedValue({
        id: 'session-1',
        sessionType: SessionType.GROUP,
        status: SessionStatus.SCHEDULED,
        tutorId: 'tutor-1',
        maxLearners: 2,
        participants: [{ learnerId: 'l1' }, { learnerId: 'l2' }],
      });
      tutoringRepo.findParticipant.mockResolvedValue(null);

      await expect(service.joinGroupSession('l3', 'session-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
