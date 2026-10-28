import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyPasswordOtpDto {
  @ApiProperty({ example: 'student@university.edu', description: 'Registered university email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email: string;

  @ApiPropertyOptional({ example: '123456', description: '6-digit OTP code received in email (frontend property name)' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ example: '123456', description: '6-digit OTP code received in email (alternative property name)' })
  @IsString()
  @IsOptional()
  otp?: string;
}
