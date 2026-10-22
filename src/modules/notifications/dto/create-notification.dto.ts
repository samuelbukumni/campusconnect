import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsString,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ description: 'UUID of the recipient student' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'New Tutoring Session Confirmed' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Your tutor Samuel has confirmed the session for MTH101 on Friday at 2 PM.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ enum: NotificationType, default: NotificationType.SYSTEM })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({
    example: { sessionId: '92398402-3948-4293-8402-394820394820' },
    description: 'Deep link metadata object',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
