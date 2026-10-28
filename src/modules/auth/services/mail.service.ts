import {
  Injectable,
  Logger,
  BadGatewayException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    this.fromEmail =
      this.configService.get<string>('SMTP_FROM') ||
      (smtpUser ? `CampusConnect <${smtpUser}>` : 'CampusConnect <no-reply@campusconnect.com>');

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    if (smtpUser && smtpPass) {
      this.transporter.verify((error) => {
        if (error) {
          this.logger.error(`Gmail SMTP Connection Failed: ${error.message}`);
        } else {
          this.logger.log(`Gmail SMTP Server connected successfully (${smtpUser})`);
        }
      });
    } else {
      this.logger.warn('SMTP_USER or SMTP_PASS not configured. Outgoing emails will fail.');
    }
  }

  async sendVerificationOtp(email: string, otpCode: string, firstName?: string): Promise<boolean> {
    const studentName = firstName || 'Student';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a; margin-top: 0;">CampusConnect Verification</h2>
        <p style="color: #334155; font-size: 15px;">Hello ${studentName},</p>
        <p style="color: #334155; font-size: 15px;">Welcome to <strong>CampusConnect</strong>! Please use the following 6-digit One-Time Password (OTP) to verify your student account:</p>
        <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e3a8a;">${otpCode}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This verification code will expire in <strong>10 minutes</strong>. If you did not request this code, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">CampusConnect — Peer Tutoring & Academic Collaboration Platform</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: email,
        subject: `${otpCode} is your CampusConnect Verification Code`,
        html: htmlContent,
      });

      this.logger.log(`Verification OTP email sent successfully to ${email}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send verification email to ${email}: ${error.message}`, error.stack);
      throw new BadGatewayException(
        `Failed to deliver verification email to ${email}. Please ensure the email address is valid.`,
      );
    }
  }

  async sendPasswordResetOtp(email: string, otpCode: string, firstName?: string): Promise<boolean> {
    const studentName = firstName || 'Student';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #334155; font-size: 15px;">Hello ${studentName},</p>
        <p style="color: #334155; font-size: 15px;">We received a request to reset your password for your <strong>CampusConnect</strong> account. Use the following 6-digit verification code to complete your password reset:</p>
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #b91c1c;">${otpCode}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This reset code is valid for <strong>10 minutes</strong>. If you did not request a password reset, please secure your account immediately or ignore this message.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">CampusConnect — Peer Tutoring & Academic Collaboration Platform</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: email,
        subject: `${otpCode} is your CampusConnect Password Reset Code`,
        html: htmlContent,
      });

      this.logger.log(`Password reset OTP email sent successfully to ${email}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send password reset email to ${email}: ${error.message}`, error.stack);
      throw new BadGatewayException(
        `Failed to deliver password reset email to ${email}. Please check the email address and try again.`,
      );
    }
  }
}
