import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('MAIL_FROM') || 'onboarding@resend.dev';

    if (apiKey && apiKey !== 're_your_resend_api_key_here') {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend Email Client initialized successfully');
    } else {
      this.logger.warn('RESEND_API_KEY not configured. Running in DEV mode: OTPs will be printed to server console.');
    }
  }

  async sendVerificationOtp(email: string, otpCode: string, firstName?: string): Promise<boolean> {
    const studentName = firstName || 'Student';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a; margin-top: 0;">StudyConnect Verification</h2>
        <p style="color: #334155; font-size: 15px;">Hello ${studentName},</p>
        <p style="color: #334155; font-size: 15px;">Welcome to <strong>StudyConnect</strong>! Please use the following 6-digit One-Time Password (OTP) to verify your student account:</p>
        <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e3a8a;">${otpCode}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This verification code will expire in <strong>10 minutes</strong>. If you did not request this code, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">StudyConnect — Peer Tutoring & Academic Collaboration Platform</p>
      </div>
    `;

    if (!this.resend) {
      this.logger.log(`\n=======================================================\n[DEV MAIL SIMULATION]\nTo: ${email}\nStudent: ${studentName}\nOTP Code: ${otpCode}\nValid for: 10 minutes\n=======================================================`);
      return true;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: `${otpCode} is your StudyConnect Verification Code`,
        html: htmlContent,
      });
      this.logger.log(`Verification OTP sent via Resend to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email via Resend to ${email}: ${error.message}`, error.stack);
      this.logger.log(`[FALLBACK DEV OTP for ${email}]: ${otpCode}`);
      return false;
    }
  }

  async sendPasswordResetOtp(email: string, otpCode: string, firstName?: string): Promise<boolean> {
    const studentName = firstName || 'Student';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #334155; font-size: 15px;">Hello ${studentName},</p>
        <p style="color: #334155; font-size: 15px;">We received a request to reset your password for your <strong>StudyConnect</strong> account. Use the following 6-digit verification code to complete your password reset:</p>
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #b91c1c;">${otpCode}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This reset code is valid for <strong>10 minutes</strong>. If you did not request a password reset, please secure your account immediately or ignore this message.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">StudyConnect — Peer Tutoring & Academic Collaboration Platform</p>
      </div>
    `;

    if (!this.resend) {
      this.logger.log(`\n=======================================================\n[DEV MAIL SIMULATION - PASSWORD RESET]\nTo: ${email}\nStudent: ${studentName}\nReset OTP: ${otpCode}\nValid for: 10 minutes\n=======================================================`);
      return true;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: `${otpCode} is your StudyConnect Password Reset Code`,
        html: htmlContent,
      });
      this.logger.log(`Password reset OTP sent via Resend to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset email via Resend to ${email}: ${error.message}`, error.stack);
      this.logger.log(`[FALLBACK DEV PASSWORD RESET OTP for ${email}]: ${otpCode}`);
      return false;
    }
  }
}
