import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Otp, OtpType } from '../entities/otp.entity';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly COOLDOWN_SECONDS = 60;
  private readonly EXPIRATION_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 5;

  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  async generateOtp(email: string, type: OtpType = OtpType.EMAIL_VERIFICATION): Promise<string> {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check rate limit cooldown (60 seconds)
    const recentOtp = await this.otpRepository.findOne({
      where: {
        email: normalizedEmail,
        type,
        isUsed: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (recentOtp) {
      const now = new Date().getTime();
      const createdAt = new Date(recentOtp.createdAt).getTime();
      const elapsedSeconds = Math.floor((now - createdAt) / 1000);

      if (elapsedSeconds < this.COOLDOWN_SECONDS) {
        const remainingSeconds = this.COOLDOWN_SECONDS - elapsedSeconds;
        throw new HttpException(
          `Please wait ${remainingSeconds} seconds before requesting a new code.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    // 2. Generate random 6-digit numeric string
    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Hash code for secure database storage
    const salt = await bcrypt.genSalt(8);
    const hashedCode = await bcrypt.hash(rawCode, salt);

    const expiresAt = new Date(Date.now() + this.EXPIRATION_MINUTES * 60 * 1000);

    // 4. Invalidate old unused OTPs for this email and type
    await this.otpRepository.update(
      { email: normalizedEmail, type, isUsed: false },
      { isUsed: true },
    );

    // 5. Store new OTP record
    const otp = this.otpRepository.create({
      email: normalizedEmail,
      code: hashedCode,
      type,
      expiresAt,
      isUsed: false,
      attempts: 0,
    });

    await this.otpRepository.save(otp);
    return rawCode;
  }

  async verifyOtp(
    email: string,
    rawCode: string,
    type: OtpType = OtpType.EMAIL_VERIFICATION,
  ): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await this.otpRepository.findOne({
      where: {
        email: normalizedEmail,
        type,
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired verification code. Please request a fresh one.');
    }

    // Check brute-force attempts
    if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
      otpRecord.isUsed = true;
      await this.otpRepository.save(otpRecord);
      throw new HttpException(
        'Too many failed attempts. This code has expired. Please request a new code.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const isMatch = await bcrypt.compare(rawCode, otpRecord.code);

    if (!isMatch) {
      otpRecord.attempts += 1;
      await this.otpRepository.save(otpRecord);
      const remainingAttempts = this.MAX_ATTEMPTS - otpRecord.attempts;
      throw new BadRequestException(
        `Incorrect verification code. ${remainingAttempts} attempt(s) remaining.`,
      );
    }

    // Mark as consumed
    otpRecord.isUsed = true;
    await this.otpRepository.save(otpRecord);
    return true;
  }
}
