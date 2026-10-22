import {
  IsNotEmpty,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'UUID of the completed tutoring session' })
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5, description: 'Star rating from 1 to 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @ApiPropertyOptional({
    example: 'Great tutor! Cleared all my doubts in Calculus and provided very clear notes.',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
