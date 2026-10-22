import {
  Entity,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Topic } from './topic.entity';

@Entity('courses')
export class Course extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 150 })
  department: string;

  @Column({ type: 'varchar', length: 50, default: '100' })
  level: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Topic, (topic) => topic.course, { cascade: true })
  topics: Topic[];
}
