import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionType, LocationType } from '../entities/tutoring-session.entity';

export class CreateSessionDto {
  @ApiProperty({ description: 'UUID of the peer tutor' })
  @IsUUID()
  @IsNotEmpty()
  tutorId: string;

  @ApiProperty({ description: 'UUID of the course being tutored' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiPropertyOptional({ description: 'Optional UUID of the specific syllabus topic' })
  @IsOptional()
  @IsUUID()
  topicId?: string;

  @ApiPropertyOptional({ enum: SessionType, default: SessionType.ONE_ON_ONE })
  @IsOptional()
  @IsEnum(SessionType)
  sessionType?: SessionType;

  @ApiPropertyOptional({ enum: LocationType, default: LocationType.PHYSICAL })
  @IsOptional()
  @IsEnum(LocationType)
  locationType?: LocationType;

  @ApiPropertyOptional({
    example: 'Faculty of Science Library, Study Carrel 4',
    description: 'Physical campus meetup point',
  })
  @IsOptional()
  @IsString()
  locationVenue?: string;

  @ApiPropertyOptional({
    example: 'https://meet.google.com/abc-defg-hij',
    description: 'Online meeting link',
  })
  @IsOptional()
  @IsString()
  meetingUrl?: string;

  @ApiProperty({ example: '2026-10-25T14:00:00.000Z', description: 'Scheduled date and time' })
  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;

  @ApiPropertyOptional({ example: 60, default: 60, description: 'Duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(240)
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 1, default: 1, description: 'Max participants (default 1 for 1-on-1, up to 10 for group)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  maxLearners?: number;

  @ApiPropertyOptional({
    example: 'Need deep explanation of Integration by Parts and past exam questions.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
