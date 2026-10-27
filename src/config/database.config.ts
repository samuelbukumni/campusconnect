import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  type: 'postgres' as const,
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'study_connect_db',
  synchronize: false, // Permanently disabled in favor of automated migrations
  logging: process.env.DB_LOGGING === 'true',
  ssl:
    process.env.DB_SSL === 'true' ||
    process.env.NODE_ENV === 'production' ||
    (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost'))
      ? { rejectUnauthorized: false }
      : false,
}));
