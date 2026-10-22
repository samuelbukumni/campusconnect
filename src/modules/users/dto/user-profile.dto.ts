import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  matricNumber?: string;

  @ApiPropertyOptional()
  department?: string;

  @ApiPropertyOptional()
  level?: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiPropertyOptional()
  bio?: string;

  @ApiPropertyOptional()
  avatarUrl?: string;

  @ApiPropertyOptional()
  phoneNumber?: string;

  @ApiProperty({ type: [String] })
  coursesToTeach: string[];

  @ApiProperty({ type: [String] })
  coursesNeedingHelp: string[];

  @ApiProperty()
  rating: number;

  @ApiProperty()
  reviewCount: number;

  @ApiProperty()
  totalSessionsGiven: number;

  @ApiProperty()
  totalSessionsAttended: number;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  createdAt: Date;
}
