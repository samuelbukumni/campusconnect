import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'super_secret_jwt_key_study_connect_2026',
  expiresIn: process.env.JWT_EXPIRATION || '7d',
}));
