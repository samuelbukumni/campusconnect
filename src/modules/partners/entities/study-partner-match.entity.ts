import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

export enum MatchStatus {
  ACTIVE = 'ACTIVE',
  RESHUFFLED = 'RESHUFFLED',
  COMPLETED = 'COMPLETED',
}

@Entity('study_partner_matches')
export class StudyPartnerMatch extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  studentAId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentAId' })
  studentA: User;

  @Index()
  @Column({ type: 'uuid' })
  studentBId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentBId' })
  studentB: User;

  @Index()
  @Column({ type: 'uuid' })
  courseId: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.ACTIVE,
  })
  status: MatchStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  preferredFormat: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  matchedAt: Date;
}
