import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  SESSION = 'SESSION',
  PARTNER = 'PARTNER',
  REVIEW = 'REVIEW',
  MATERIAL = 'MATERIAL',
  REPORT = 'REPORT',
  SYSTEM = 'SYSTEM',
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Index()
  @Column({ type: 'boolean', default: false })
  isRead: boolean;
}
