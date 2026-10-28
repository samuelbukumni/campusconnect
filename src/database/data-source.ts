import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../modules/users/entities/user.entity';
import { Otp } from '../modules/auth/entities/otp.entity';
import { Course } from '../modules/courses/entities/course.entity';
import { Topic } from '../modules/courses/entities/topic.entity';
import { TutoringSession } from '../modules/tutoring/entities/tutoring-session.entity';
import { SessionParticipant } from '../modules/tutoring/entities/session-participant.entity';
import { StudyPartnerMatch } from '../modules/partners/entities/study-partner-match.entity';
import { Material } from '../modules/materials/entities/material.entity';
import { Review } from '../modules/reviews/entities/review.entity';
import { Report } from '../modules/reports/entities/report.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { InitialSchema1730000000000 } from './migrations/1730000000000-InitialSchema';
import { AddGenderToUsers1730000000001 } from './migrations/1730000000001-AddGenderToUsers';

dotenv.config();

const useSsl =
  process.env.DB_SSL === 'true' ||
  process.env.NODE_ENV === 'production' ||
  (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost'));

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'study_connect_db',
      }),
  entities: [
    User,
    Otp,
    Course,
    Topic,
    TutoringSession,
    SessionParticipant,
    StudyPartnerMatch,
    Material,
    Review,
    Report,
    Notification,
  ],
  migrations: [InitialSchema1730000000000, AddGenderToUsers1730000000001],
  migrationsRun: true,
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  ssl: useSsl ? { rejectUnauthorized: false } : false,
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
