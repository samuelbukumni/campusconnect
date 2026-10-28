import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'student@university.edu', description: 'Registered university email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code received in email' })
  @IsString()
  @IsNotEmpty({ message: 'Verification OTP code is required' })
  otp: string;

  @ApiProperty({ example: 'NewSecureP@ss123', minLength: 6, description: 'New account password' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'New password is required' })
  newPassword: string;
}
