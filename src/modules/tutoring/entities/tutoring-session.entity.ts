import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Topic } from '../../courses/entities/topic.entity';
import { SessionParticipant } from './session-participant.entity';

export enum SessionType {
  ONE_ON_ONE = 'ONE_ON_ONE',
  GROUP = 'GROUP',
}

export enum LocationType {
  PHYSICAL = 'PHYSICAL',
  ONLINE = 'ONLINE',
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('tutoring_sessions')
export class TutoringSession extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  tutorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tutorId' })
  tutor: User;

  @Index()
  @Column({ type: 'uuid' })
  courseId: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ type: 'uuid', nullable: true })
  topicId: string;

  @ManyToOne(() => Topic, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'topicId' })
  topic: Topic;

  @Column({
    type: 'enum',
    enum: SessionType,
    default: SessionType.ONE_ON_ONE,
  })
  sessionType: SessionType;

  @Column({
    type: 'enum',
    enum: LocationType,
    default: LocationType.PHYSICAL,
  })
  locationType: LocationType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  locationVenue: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  meetingUrl: string;

  @Index()
  @Column({ type: 'timestamp with time zone' })
  scheduledAt: Date;

  @Column({ type: 'int', default: 60 })
  durationMinutes: number;

  @Column({ type: 'int', default: 1 })
  maxLearners: number;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
  })
  status: SessionStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => SessionParticipant, (participant) => participant.session, {
    cascade: true,
  })
  participants: SessionParticipant[];
}
