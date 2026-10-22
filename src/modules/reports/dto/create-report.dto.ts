import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportReason } from '../entities/report.entity';

export class CreateReportDto {
  @ApiProperty({ description: 'UUID of the user being reported' })
  @IsUUID()
  @IsNotEmpty()
  reportedUserId: string;

  @ApiPropertyOptional({ description: 'Optional UUID of the tutoring session where incident occurred' })
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @ApiProperty({ enum: ReportReason, default: ReportReason.OTHER })
  @IsEnum(ReportReason)
  @IsNotEmpty()
  reason: ReportReason;

  @ApiProperty({
    example: 'User did not show up to scheduled 1-on-1 session at Faculty Library.',
    description: 'Detailed description of the incident',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
