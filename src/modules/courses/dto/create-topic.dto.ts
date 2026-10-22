import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TopicDifficulty } from '../entities/topic.entity';

export class CreateTopicDto {
  @ApiProperty({ example: 'Integration by Parts' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Techniques for integrating products of functions.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TopicDifficulty, default: TopicDifficulty.BEGINNER })
  @IsOptional()
  @IsEnum(TopicDifficulty)
  difficulty?: TopicDifficulty;
}
