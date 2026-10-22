import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionStatus } from '../entities/tutoring-session.entity';

export class UpdateSessionStatusDto {
  @ApiProperty({ enum: SessionStatus, example: SessionStatus.CONFIRMED })
  @IsEnum(SessionStatus)
  @IsNotEmpty()
  status: SessionStatus;

  @ApiPropertyOptional({ example: 'Tutor or learner had a timetable clash' })
  @IsOptional()
  @IsString()
  reason?: string;
}
