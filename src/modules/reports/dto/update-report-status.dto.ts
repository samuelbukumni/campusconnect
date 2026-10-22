import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus } from '../entities/report.entity';

export class UpdateReportStatusDto {
  @ApiProperty({ enum: ReportStatus, example: ReportStatus.RESOLVED })
  @IsEnum(ReportStatus)
  @IsNotEmpty()
  status: ReportStatus;

  @ApiPropertyOptional({
    example: 'Spoke with both parties. Session rescheduled and warning issued.',
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
