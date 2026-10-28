import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserGender } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Ada' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Lovelace' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'SCI/2023/1042' })
  @IsOptional()
  @IsString()
  matricNumber?: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: '400' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({
    enum: UserGender,
    example: UserGender.FEMALE,
    description: 'Student gender (MALE or FEMALE)',
  })
  @IsOptional()
  @IsEnum(UserGender, { message: 'Gender must be MALE or FEMALE' })
  gender?: UserGender;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: 'Passionate about algorithms and calculus peer tutoring.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'https://images.example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: ['CSC201', 'CSC301'], type: [String] })
  @IsOptional()
  @IsArray()
  coursesToTeach?: string[];

  @ApiPropertyOptional({ example: ['PHY102'], type: [String] })
  @IsOptional()
  @IsArray()
  coursesNeedingHelp?: string[];

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
