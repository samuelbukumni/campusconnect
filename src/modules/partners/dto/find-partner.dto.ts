import { IsNotEmpty, IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FindPartnerDto {
  @ApiProperty({ description: 'UUID of the course to find a study partner for' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiPropertyOptional({
    example: 'PHYSICAL',
    description: 'Preferred meetup format (PHYSICAL, ONLINE, or BOTH)',
  })
  @IsOptional()
  @IsString()
  preferredFormat?: string;

  @ApiPropertyOptional({
    example: 'Looking for someone preparing for midterms to review past papers together.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
