import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ResendOtpDto } from '../dto/resend-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { VerifyPasswordOtpDto } from '../dto/verify-password-otp.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Authentication & Verification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register a new student account (Tutor, Learner, or Both) and send 6-digit OTP',
  })
  @ApiResponse({
    status: 201,
    description: 'Student created successfully. 6-digit OTP code dispatched to university email.',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify student email with 6-digit OTP code to activate account and receive JWT',
  })
  @ApiResponse({
    status: 200,
    description: 'Account verified successfully. Access token and profile returned.',
    type: AuthResponseDto,
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<AuthResponseDto> {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend a fresh 6-digit OTP verification code (60-second cooldown rate limit)',
  })
  @ApiResponse({
    status: 200,
    description: 'Fresh OTP code dispatched to student email.',
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded: Cooldown period active.',
  })
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request a 6-digit password reset OTP sent to registered student email',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset code dispatched to student email if registered.',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('forgot-password/resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend a 6-digit password reset OTP to registered student email (60-second cooldown)',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset code redispatched to student email if registered.',
  })
  async resendForgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.resendForgotPasswordOtp(forgotPasswordDto);
  }

  @Public()
  @Post('forgot-password/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify 6-digit password reset OTP and obtain a temporary reset token',
  })
  @ApiResponse({
    status: 200,
    description: 'Reset OTP verified. Returns short-lived resetToken for password update.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP code.',
  })
  async verifyForgotPassword(@Body() verifyPasswordOtpDto: VerifyPasswordOtpDto) {
    return this.authService.verifyForgotPasswordOtp(verifyPasswordOtpDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset student account password using temporary resetToken or 6-digit verification code',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully. Student can now log in.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP verification code or reset token.',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Post('forgot-password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Alias for reset-password endpoint to accommodate alternative frontend routing',
  })
  async resetPasswordAlias(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate verified student and receive JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated. Access token and profile returned.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or unverified student account.',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({
    summary: 'Get current authenticated student session & academic profile details',
  })
  @ApiResponse({
    status: 200,
    description: 'Current student profile, courses, and session metrics.',
  })
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}
