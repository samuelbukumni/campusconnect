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

@Entity('reviews')
export class Review extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => TutoringSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: TutoringSession;

  @Index()
  @Column({ type: 'uuid' })
  tutorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tutorId' })
  tutor: User;

  @Index()
  @Column({ type: 'uuid' })
  learnerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learnerId' })
  learner: User;

  @Column({ type: 'int' })
  rating: number; // 1 to 5

  @Column({ type: 'text', nullable: true })
  comment: string;
}
