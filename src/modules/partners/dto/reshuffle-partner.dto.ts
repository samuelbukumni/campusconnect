import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReshufflePartnerDto {
  @ApiPropertyOptional({
    example: 'Incompatible study schedules; need a morning study partner.',
    description: 'Reason for requesting a partner reshuffle',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
