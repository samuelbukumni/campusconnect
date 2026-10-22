import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsString,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaterialType } from '../entities/material.entity';

export class UploadMaterialDto {
  @ApiProperty({ description: 'UUID of the course this material belongs to' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiPropertyOptional({ description: 'Optional UUID of the specific syllabus topic' })
  @IsOptional()
  @IsUUID()
  topicId?: string;

  @ApiProperty({ example: 'CSC101 Midterm Past Questions with Detailed Solutions' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Handwritten and typed solutions from 2022 to 2025' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://storage.campusconnect.edu/notes/csc101-solutions.pdf' })
  @IsUrl()
  @IsNotEmpty()
  fileUrl: string;

  @ApiPropertyOptional({ enum: MaterialType, default: MaterialType.LECTURE_NOTES })
  @IsOptional()
  @IsEnum(MaterialType)
  materialType?: MaterialType;

  @ApiPropertyOptional({ example: 'pdf', default: 'pdf' })
  @IsOptional()
  @IsString()
  fileFormat?: string;
}
