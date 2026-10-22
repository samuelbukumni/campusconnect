import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TutoringSession, SessionStatus, SessionType } from '../entities/tutoring-session.entity';
import { SessionParticipant } from '../entities/session-participant.entity';
import { CreateSessionDto } from '../dto/create-session.dto';

@Injectable()
export class TutoringRepository {
  constructor(
    @InjectRepository(TutoringSession)
    private readonly sessionRepo: Repository<TutoringSession>,
    @InjectRepository(SessionParticipant)
    private readonly participantRepo: Repository<SessionParticipant>,
  ) {}

  async createSession(dto: CreateSessionDto): Promise<TutoringSession> {
    const session = this.sessionRepo.create({
      tutorId: dto.tutorId,
      courseId: dto.courseId,
      topicId: dto.topicId,
      sessionType: dto.sessionType || SessionType.ONE_ON_ONE,
      locationType: dto.locationType,
      locationVenue: dto.locationVenue,
      meetingUrl: dto.meetingUrl,
      scheduledAt: new Date(dto.scheduledAt),
      durationMinutes: dto.durationMinutes || 60,
      maxLearners: dto.sessionType === SessionType.GROUP ? (dto.maxLearners || 5) : 1,
      notes: dto.notes,
      status: SessionStatus.SCHEDULED,
    });

    return this.sessionRepo.save(session);
  }

  async findById(id: string): Promise<TutoringSession | null> {
    return this.sessionRepo.findOne({
      where: { id },
      relations: ['tutor', 'course', 'topic', 'participants', 'participants.learner'],
    });
  }

  async findUserSessions(userId: string): Promise<TutoringSession[]> {
    return this.sessionRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.tutor', 'tutor')
      .leftJoinAndSelect('session.course', 'course')
      .leftJoinAndSelect('session.topic', 'topic')
      .leftJoinAndSelect('session.participants', 'participants')
      .leftJoinAndSelect('participants.learner', 'learner')
      .where('session.tutorId = :userId', { userId })
      .orWhere('participants.learnerId = :userId', { userId })
      .orderBy('session.scheduledAt', 'DESC')
      .getMany();
  }

  async findOpenGroupSessions(courseId?: string): Promise<TutoringSession[]> {
    const qb = this.sessionRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.tutor', 'tutor')
      .leftJoinAndSelect('session.course', 'course')
      .leftJoinAndSelect('session.topic', 'topic')
      .leftJoinAndSelect('session.participants', 'participants')
      .where('session.sessionType = :groupType', { groupType: SessionType.GROUP })
      .andWhere('session.status IN (:...statuses)', {
        statuses: [SessionStatus.SCHEDULED, SessionStatus.CONFIRMED],
      })
      .andWhere('session.scheduledAt > :now', { now: new Date() });

    if (courseId) {
      qb.andWhere('session.courseId = :courseId', { courseId });
    }

    return qb.orderBy('session.scheduledAt', 'ASC').getMany();
  }

  async addParticipant(sessionId: string, learnerId: string, notes?: string): Promise<SessionParticipant> {
    const participant = this.participantRepo.create({
      sessionId,
      learnerId,
      notes,
    });
    return this.participantRepo.save(participant);
  }

  async findParticipant(sessionId: string, learnerId: string): Promise<SessionParticipant | null> {
    return this.participantRepo.findOne({
      where: { sessionId, learnerId },
    });
  }

  async updateStatus(id: string, status: SessionStatus): Promise<TutoringSession | null> {
    await this.sessionRepo.update(id, { status });
    return this.findById(id);
  }
}
