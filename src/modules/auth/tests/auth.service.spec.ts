import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../../users/services/users.service';
import { OtpService } from '../services/otp.service';
import { MailService } from '../services/mail.service';
import { OtpType } from '../entities/otp.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;
  let otpService: Partial<Record<keyof OtpService, jest.Mock>>;
  let mailService: Partial<Record<keyof MailService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      updatePassword: jest.fn().mockResolvedValue(undefined),
      markVerified: jest.fn().mockResolvedValue(undefined),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn().mockReturnValue({ sub: 'user-uuid', email: 'student@uni.edu', purpose: 'password_reset' }),
    };

    otpService = {
      generateOtp: jest.fn().mockResolvedValue('123456'),
      verifyOtp: jest.fn().mockResolvedValue(true),
    };

    mailService = {
      sendVerificationOtp: jest.fn().mockResolvedValue(true),
      sendPasswordResetOtp: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: OtpService, useValue: otpService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('forgotPassword', () => {
    it('should generate OTP and send password reset email if user exists', async () => {
      usersService.findByEmail!.mockResolvedValue({
        id: 'user-uuid',
        email: 'student@uni.edu',
        firstName: 'Ada',
      });

      const result = await service.forgotPassword({ email: 'student@uni.edu' });

      expect(usersService.findByEmail).toHaveBeenCalledWith('student@uni.edu');
      expect(otpService.generateOtp).toHaveBeenCalledWith('student@uni.edu', OtpType.PASSWORD_RESET);
      expect(mailService.sendPasswordResetOtp).toHaveBeenCalledWith('student@uni.edu', '123456', 'Ada');
      expect(result.message).toContain('If this email address is registered');
    });

    it('should return standard message even if user does not exist (enumeration safe)', async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      const result = await service.forgotPassword({ email: 'nonexistent@uni.edu' });

      expect(otpService.generateOtp).not.toHaveBeenCalled();
      expect(result.message).toContain('If this email address is registered');
    });

    it('should resend password reset OTP', async () => {
      usersService.findByEmail!.mockResolvedValue({
        id: 'user-uuid',
        email: 'student@uni.edu',
        firstName: 'Ada',
      });

      const result = await service.resendForgotPasswordOtp({ email: 'student@uni.edu' });

      expect(usersService.findByEmail).toHaveBeenCalledWith('student@uni.edu');
      expect(result.message).toContain('If this email address is registered');
    });
  });

  describe('verifyForgotPasswordOtp', () => {
    it('should verify code and return resetToken', async () => {
      usersService.findByEmail!.mockResolvedValue({
        id: 'user-uuid',
        email: 'student@uni.edu',
      });

      const result = await service.verifyForgotPasswordOtp({
        email: 'student@uni.edu',
        code: '123456',
      });

      expect(otpService.verifyOtp).toHaveBeenCalledWith('student@uni.edu', '123456', OtpType.PASSWORD_RESET);
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'user-uuid', email: 'student@uni.edu', purpose: 'password_reset' }),
        { expiresIn: '15m' },
      );
      expect(result.resetToken).toBe('mock-jwt-token');
      expect(result.message).toContain('Code verified successfully');
    });
  });

  describe('resetPassword', () => {
    it('should reset password using resetToken', async () => {
      usersService.findById!.mockResolvedValue({
        id: 'user-uuid',
        email: 'student@uni.edu',
      });

      const result = await service.resetPassword({
        resetToken: 'mock-jwt-token',
        newPassword: 'BrandNewPassword123',
      });

      expect(jwtService.verify).toHaveBeenCalledWith('mock-jwt-token');
      expect(usersService.findById).toHaveBeenCalledWith('user-uuid');
      expect(usersService.updatePassword).toHaveBeenCalled();
      expect(result.message).toContain('Password reset successful');
    });

    it('should verify OTP and update password directly with email and otp', async () => {
      usersService.findByEmail!.mockResolvedValue({
        id: 'user-uuid',
        email: 'student@uni.edu',
      });

      const result = await service.resetPassword({
        email: 'student@uni.edu',
        otp: '123456',
        newPassword: 'BrandNewPassword123',
      });

      expect(otpService.verifyOtp).toHaveBeenCalledWith('student@uni.edu', '123456', OtpType.PASSWORD_RESET);
      expect(usersService.updatePassword).toHaveBeenCalled();
      expect(result.message).toContain('Password reset successful');
    });
  });
});
