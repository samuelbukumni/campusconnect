import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TutoringRepository } from '../repositories/tutoring.repository';
import { CreateSessionDto } from '../dto/create-session.dto';
import { UpdateSessionStatusDto } from '../dto/update-session-status.dto';
import {
  TutoringSession,
  SessionStatus,
  SessionType,
} from '../entities/tutoring-session.entity';
import { UsersRepository } from '../../users/repositories/users.repository';
import { CoursesRepository } from '../../courses/repositories/courses.repository';

@Injectable()
export class TutoringService {
  constructor(
    private readonly tutoringRepo: TutoringRepository,
    private readonly usersRepo: UsersRepository,
    private readonly coursesRepo: CoursesRepository,
  ) {}

  async bookSession(
    learnerId: string,
    dto: CreateSessionDto,
  ): Promise<TutoringSession> {
    if (learnerId === dto.tutorId) {
      throw new BadRequestException('You cannot book a tutoring session with yourself');
    }

    const tutor = await this.usersRepo.findById(dto.tutorId);
    if (!tutor) {
      throw new NotFoundException(`Tutor with ID ${dto.tutorId} not found`);
    }

    const course = await this.coursesRepo.findById(dto.courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${dto.courseId} not found`);
    }

    // Create the session
    const session = await this.tutoringRepo.createSession(dto);

    // Automatically add the booking learner as a participant
    await this.tutoringRepo.addParticipant(
      session.id,
      learnerId,
      dto.notes || 'Initial booking request',
    );

    return (await this.tutoringRepo.findById(session.id))!;
  }

  async joinGroupSession(
    learnerId: string,
    sessionId: string,
    notes?: string,
  ): Promise<TutoringSession> {
    const session = await this.tutoringRepo.findById(sessionId);
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    if (session.sessionType !== SessionType.GROUP) {
      throw new BadRequestException('Only group sessions can be joined directly');
    }

    if (
      session.status === SessionStatus.CANCELLED ||
      session.status === SessionStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `Cannot join a session that is ${session.status.toLowerCase()}`,
      );
    }

    if (session.tutorId === learnerId) {
      throw new BadRequestException('You are already the host/tutor of this session');
    }

    const existingParticipant = await this.tutoringRepo.findParticipant(
      sessionId,
      learnerId,
    );
    if (existingParticipant) {
      throw new BadRequestException('You have already joined this session');
    }

    const currentCount = session.participants?.length || 0;
    if (currentCount >= session.maxLearners) {
      throw new BadRequestException('This group session is already at full capacity');
    }

    await this.tutoringRepo.addParticipant(sessionId, learnerId, notes);
    return (await this.tutoringRepo.findById(sessionId))!;
  }

  async getMySessions(userId: string): Promise<TutoringSession[]> {
    return this.tutoringRepo.findUserSessions(userId);
  }

  async getSessionById(id: string): Promise<TutoringSession> {
    const session = await this.tutoringRepo.findById(id);
    if (!session) {
      throw new NotFoundException(`Tutoring session with ID ${id} not found`);
    }
    return session;
  }

  async updateStatus(
    userId: string,
    sessionId: string,
    dto: UpdateSessionStatusDto,
  ): Promise<TutoringSession> {
    const session = await this.tutoringRepo.findById(sessionId);
    if (!session) {
      throw new NotFoundException(`Tutoring session with ID ${sessionId} not found`);
    }

    const isTutor = session.tutorId === userId;
    const isParticipant = session.participants?.some((p) => p.learnerId === userId);

    if (!isTutor && !isParticipant) {
      throw new ForbiddenException(
        'You are not authorized to update the status of this session',
      );
    }

    // Only tutor can confirm or complete a session
    if (
      (dto.status === SessionStatus.CONFIRMED ||
        dto.status === SessionStatus.COMPLETED) &&
      !isTutor
    ) {
      throw new ForbiddenException(
        'Only the assigned tutor can confirm or complete a session',
      );
    }

    const updated = await this.tutoringRepo.updateStatus(sessionId, dto.status);
    return updated!;
  }

  async getOpenGroupSessions(courseId?: string): Promise<TutoringSession[]> {
    return this.tutoringRepo.findOpenGroupSessions(courseId);
  }
}
