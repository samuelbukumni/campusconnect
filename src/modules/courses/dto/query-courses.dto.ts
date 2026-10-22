import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryCoursesDto {
  @ApiPropertyOptional({ example: 'Integration', description: 'Search query for code, title, or topic' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 'Mathematics & Statistics' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: '100' })
  @IsOptional()
  @IsString()
  level?: string;
}
