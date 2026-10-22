import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'MTH 102', description: 'Course code (uppercase)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'Elementary Mathematics II (Calculus)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Mathematics & Statistics' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  department: string;

  @ApiPropertyOptional({ example: '100', default: '100' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({
    example: 'Covers differential calculus, integral calculus, limits, and applications.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
