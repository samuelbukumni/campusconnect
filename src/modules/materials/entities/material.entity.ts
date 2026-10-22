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
import { Topic } from '../../courses/entities/topic.entity';

export enum MaterialType {
  LECTURE_NOTES = 'LECTURE_NOTES',
  PAST_QUESTIONS = 'PAST_QUESTIONS',
  SLIDES = 'SLIDES',
  LAB_REPORT = 'LAB_REPORT',
  OTHER = 'OTHER',
}

@Entity('academic_materials')
export class Material extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  uploaderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uploaderId' })
  uploader: User;

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

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 1000 })
  fileUrl: string;

  @Column({
    type: 'enum',
    enum: MaterialType,
    default: MaterialType.LECTURE_NOTES,
  })
  materialType: MaterialType;

  @Column({ type: 'varchar', length: 50, default: 'pdf' })
  fileFormat: string;

  @Column({ type: 'int', default: 0 })
  downloadsCount: number;
}
