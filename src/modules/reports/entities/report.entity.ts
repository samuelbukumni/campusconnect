import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { TutoringSession } from '../../tutoring/entities/tutoring-session.entity';

export enum ReportReason {
  NO_SHOW = 'NO_SHOW',
  HARASSMENT = 'HARASSMENT',
  ACADEMIC_DISHONESTY = 'ACADEMIC_DISHONESTY',
  INAPPROPRIATE_BEHAVIOR = 'INAPPROPRIATE_BEHAVIOR',
  OTHER = 'OTHER',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

@Entity('reports')
export class Report extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  reporterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  @Index()
  @Column({ type: 'uuid' })
  reportedUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportedUserId' })
  reportedUser: User;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  sessionId: string;

  @ManyToOne(() => TutoringSession, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sessionId' })
  session: TutoringSession;

  @Column({
    type: 'enum',
    enum: ReportReason,
    default: ReportReason.OTHER,
  })
  reason: ReportReason;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;
}
