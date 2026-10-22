import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpDto {
  @ApiProperty({ example: 'student@university.edu' })
  @IsEmail({}, { message: 'Please provide a valid university email' })
  @IsNotEmpty()
  email: string;
}
