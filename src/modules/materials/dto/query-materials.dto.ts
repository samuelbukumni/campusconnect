import { IsOptional, IsUUID, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MaterialType } from '../entities/material.entity';

export class QueryMaterialsDto {
  @ApiPropertyOptional({ description: 'Filter by course UUID' })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Filter by topic UUID' })
  @IsOptional()
  @IsUUID()
  topicId?: string;

  @ApiPropertyOptional({ enum: MaterialType, description: 'Filter by material category' })
  @IsOptional()
  @IsEnum(MaterialType)
  materialType?: MaterialType;

  @ApiPropertyOptional({ description: 'Search keywords in title or description' })
  @IsOptional()
  @IsString()
  search?: string;
}
