import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';

export enum OtpType {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

@Entity('otp_codes')
export class Otp extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  code: string;

  @Column({
    type: 'enum',
    enum: OtpType,
    default: OtpType.EMAIL_VERIFICATION,
  })
  type: OtpType;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isUsed: boolean;
}
