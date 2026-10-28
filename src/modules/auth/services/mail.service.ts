import {
  Injectable,
  Logger,
  BadGatewayException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey: string | undefined;
  private readonly senderEmail: string;
  private readonly senderName: string = 'CampusConnect';
  private readonly brevoApiUrl = 'https://api.brevo.com/v3/smtp/email';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BREVO_API_KEY');
    this.senderEmail =
      this.configService.get<string>('BREVO_SENDER_EMAIL') || 'denisfeyisola@gmail.com';

    if (this.apiKey && this.apiKey !== 'xkeysib-your_brevo_api_key_here') {
      this.logger.log(`Brevo HTTP Email Client initialized successfully (Sender: ${this.senderEmail})`);
    } else {
      this.logger.warn('BREVO_API_KEY not configured. Outgoing emails will fail.');
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

    return this.sendViaBrevo({
      toEmail: email,
      toName: studentName,
      subject: `${otpCode} is your CampusConnect Verification Code`,
      htmlContent,
    });
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

    return this.sendViaBrevo({
      toEmail: email,
      toName: studentName,
      subject: `${otpCode} is your CampusConnect Password Reset Code`,
      htmlContent,
    });
  }

  private async sendViaBrevo(params: {
    toEmail: string;
    toName: string;
    subject: string;
    htmlContent: string;
  }): Promise<boolean> {
    if (!this.apiKey) {
      throw new BadGatewayException('Email delivery failed: BREVO_API_KEY is not configured on the server.');
    }

    try {
      const response = await fetch(this.brevoApiUrl, {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: this.senderName,
            email: this.senderEmail,
          },
          to: [
            {
              email: params.toEmail,
              name: params.toName,
            },
          ],
          subject: params.subject,
          htmlContent: params.htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || response.statusText;
        this.logger.error(`Brevo API Error (${response.status}): ${errorMessage}`);
        throw new BadGatewayException(
          `Failed to deliver email to ${params.toEmail}: ${errorMessage}`,
        );
      }

      this.logger.log(`Email delivered successfully via Brevo HTTPS to ${params.toEmail}`);
      return true;
    } catch (error: any) {
      if (error instanceof BadGatewayException) {
        throw error;
      }
      this.logger.error(`Brevo Network Error: ${error.message}`, error.stack);
      throw new BadGatewayException(
        `Failed to deliver email to ${params.toEmail}. Please verify the email address or try again.`,
      );
    }
  }
}
