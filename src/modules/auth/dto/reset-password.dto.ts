import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiPropertyOptional({
    example: 'eyJhbGciOiJIUzI1NiIsIn...',
    description: 'Temporary password reset token obtained from /auth/forgot-password/verify',
  })
  @IsString()
  @IsOptional()
  resetToken?: string;

  @ApiPropertyOptional({ example: 'student@university.edu', description: 'Registered university email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '123456', description: '6-digit OTP code received in email' })
  @IsString()
  @IsOptional()
  otp?: string;

  @ApiProperty({ example: 'NewSecureP@ss123', minLength: 6, description: 'New account password' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'New password is required' })
  newPassword: string;
}
