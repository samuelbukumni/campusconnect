import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1730000000000 implements MigrationInterface {
  name = 'InitialSchema1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enable UUID Extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 2. Custom Enumerated Types
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN
          CREATE TYPE "users_role_enum" AS ENUM('LEARNER', 'TUTOR', 'BOTH', 'ADMIN');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'otp_codes_type_enum') THEN
          CREATE TYPE "otp_codes_type_enum" AS ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'topics_difficulty_enum') THEN
          CREATE TYPE "topics_difficulty_enum" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tutoring_sessions_sessiontype_enum') THEN
          CREATE TYPE "tutoring_sessions_sessiontype_enum" AS ENUM('ONE_ON_ONE', 'GROUP');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tutoring_sessions_locationtype_enum') THEN
          CREATE TYPE "tutoring_sessions_locationtype_enum" AS ENUM('PHYSICAL', 'ONLINE');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tutoring_sessions_status_enum') THEN
          CREATE TYPE "tutoring_sessions_status_enum" AS ENUM('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'study_partner_matches_status_enum') THEN
          CREATE TYPE "study_partner_matches_status_enum" AS ENUM('ACTIVE', 'RESHUFFLED', 'COMPLETED');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'academic_materials_materialtype_enum') THEN
          CREATE TYPE "academic_materials_materialtype_enum" AS ENUM('LECTURE_NOTES', 'PAST_QUESTIONS', 'SLIDES', 'LAB_REPORT', 'OTHER');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reports_reason_enum') THEN
          CREATE TYPE "reports_reason_enum" AS ENUM('NO_SHOW', 'HARASSMENT', 'ACADEMIC_DISHONESTY', 'INAPPROPRIATE_BEHAVIOR', 'OTHER');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reports_status_enum') THEN
          CREATE TYPE "reports_status_enum" AS ENUM('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notifications_type_enum') THEN
          CREATE TYPE "notifications_type_enum" AS ENUM('SESSION', 'PARTNER', 'REVIEW', 'MATERIAL', 'REPORT', 'SYSTEM');
        END IF;
      END $$;
    `);

    // 3. Create Tables
    // users
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "email" character varying(255) NOT NULL,
        "password" character varying(255) NOT NULL,
        "firstName" character varying(100) NOT NULL,
        "lastName" character varying(100) NOT NULL,
        "matricNumber" character varying(50),
        "department" character varying(150),
        "level" character varying(50),
        "role" "users_role_enum" NOT NULL DEFAULT 'BOTH',
        "bio" text,
        "avatarUrl" character varying(255),
        "phoneNumber" character varying(30),
        "coursesToTeach" text,
        "coursesNeedingHelp" text,
        "rating" numeric(3,2) NOT NULL DEFAULT '0',
        "reviewCount" integer NOT NULL DEFAULT 0,
        "totalSessionsGiven" integer NOT NULL DEFAULT 0,
        "totalSessionsAttended" integer NOT NULL DEFAULT 0,
        "isVerified" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      );
    `);

    // otp_codes
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "otp_codes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "email" character varying(255) NOT NULL,
        "code" character varying(255) NOT NULL,
        "type" "otp_codes_type_enum" NOT NULL DEFAULT 'EMAIL_VERIFICATION',
        "attempts" integer NOT NULL DEFAULT 0,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "isUsed" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_otp_codes_id" PRIMARY KEY ("id")
      );
      CREATE INDEX IF NOT EXISTS "IDX_otp_codes_email" ON "otp_codes" ("email");
    `);

    // courses
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "courses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "code" character varying(20) NOT NULL,
        "title" character varying(255) NOT NULL,
        "department" character varying(150) NOT NULL,
        "level" character varying(50) NOT NULL DEFAULT '100',
        "description" text,
        CONSTRAINT "UQ_courses_code" UNIQUE ("code"),
        CONSTRAINT "PK_courses_id" PRIMARY KEY ("id")
      );
    `);

    // topics
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "topics" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "title" character varying(255) NOT NULL,
        "description" text,
        "difficulty" "topics_difficulty_enum" NOT NULL DEFAULT 'BEGINNER',
        "courseId" uuid NOT NULL,
        CONSTRAINT "PK_topics_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_topics_courseId" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "IDX_topics_title" ON "topics" ("title");
    `);

    // tutoring_sessions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tutoring_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "tutorId" uuid NOT NULL,
        "courseId" uuid NOT NULL,
        "topicId" uuid,
        "sessionType" "tutoring_sessions_sessiontype_enum" NOT NULL DEFAULT 'ONE_ON_ONE',
        "locationType" "tutoring_sessions_locationtype_enum" NOT NULL DEFAULT 'PHYSICAL',
        "locationVenue" character varying(255),
        "meetingUrl" character varying(500),
        "scheduledAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "durationMinutes" integer NOT NULL DEFAULT 60,
        "maxLearners" integer NOT NULL DEFAULT 1,
        "status" "tutoring_sessions_status_enum" NOT NULL DEFAULT 'SCHEDULED',
        "notes" text,
        CONSTRAINT "PK_tutoring_sessions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tutoring_sessions_tutorId" FOREIGN KEY ("tutorId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tutoring_sessions_courseId" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tutoring_sessions_topicId" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL
      );
      CREATE INDEX IF NOT EXISTS "IDX_tutoring_sessions_tutorId" ON "tutoring_sessions" ("tutorId");
      CREATE INDEX IF NOT EXISTS "IDX_tutoring_sessions_courseId" ON "tutoring_sessions" ("courseId");
      CREATE INDEX IF NOT EXISTS "IDX_tutoring_sessions_scheduledAt" ON "tutoring_sessions" ("scheduledAt");
    `);

    // session_participants
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "session_participants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "sessionId" uuid NOT NULL,
        "learnerId" uuid NOT NULL,
        "notes" text,
        CONSTRAINT "PK_session_participants_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_session_participants_sessionId" FOREIGN KEY ("sessionId") REFERENCES "tutoring_sessions"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_session_participants_learnerId" FOREIGN KEY ("learnerId") REFERENCES "users"("id") ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_participants_sessionId" ON "session_participants" ("sessionId");
      CREATE INDEX IF NOT EXISTS "IDX_session_participants_learnerId" ON "session_participants" ("learnerId");
    `);

    // study_partner_matches
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "study_partner_matches" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "studentAId" uuid NOT NULL,
        "studentBId" uuid NOT NULL,
        "courseId" uuid NOT NULL,
        "status" "study_partner_matches_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "preferredFormat" character varying(100),
        "notes" text,
        "matchedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_study_partner_matches_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_study_partner_matches_studentAId" FOREIGN KEY ("studentAId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_study_partner_matches_studentBId" FOREIGN KEY ("studentBId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_study_partner_matches_courseId" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "IDX_study_partner_matches_studentAId" ON "study_partner_matches" ("studentAId");
      CREATE INDEX IF NOT EXISTS "IDX_study_partner_matches_studentBId" ON "study_partner_matches" ("studentBId");
      CREATE INDEX IF NOT EXISTS "IDX_study_partner_matches_courseId" ON "study_partner_matches" ("courseId");
    `);

    // academic_materials
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "academic_materials" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "uploaderId" uuid NOT NULL,
        "courseId" uuid NOT NULL,
        "topicId" uuid,
        "title" character varying(255) NOT NULL,
        "description" text,
        "fileUrl" character varying(1000) NOT NULL,
        "materialType" "academic_materials_materialtype_enum" NOT NULL DEFAULT 'LECTURE_NOTES',
        "fileFormat" character varying(50) NOT NULL DEFAULT 'pdf',
        "downloadsCount" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_academic_materials_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_academic_materials_uploaderId" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_academic_materials_courseId" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_academic_materials_topicId" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL
      );
      CREATE INDEX IF NOT EXISTS "IDX_academic_materials_uploaderId" ON "academic_materials" ("uploaderId");
      CREATE INDEX IF NOT EXISTS "IDX_academic_materials_courseId" ON "academic_materials" ("courseId");
    `);

    // reviews
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reviews" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "sessionId" uuid NOT NULL,
        "tutorId" uuid NOT NULL,
        "learnerId" uuid NOT NULL,
        "rating" integer NOT NULL,
        "comment" text,
        CONSTRAINT "PK_reviews_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reviews_sessionId" FOREIGN KEY ("sessionId") REFERENCES "tutoring_sessions"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reviews_tutorId" FOREIGN KEY ("tutorId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reviews_learnerId" FOREIGN KEY ("learnerId") REFERENCES "users"("id") ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "IDX_reviews_sessionId" ON "reviews" ("sessionId");
      CREATE INDEX IF NOT EXISTS "IDX_reviews_tutorId" ON "reviews" ("tutorId");
      CREATE INDEX IF NOT EXISTS "IDX_reviews_learnerId" ON "reviews" ("learnerId");
    `);

    // reports
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reports" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "reporterId" uuid NOT NULL,
        "reportedUserId" uuid NOT NULL,
        "sessionId" uuid,
        "reason" "reports_reason_enum" NOT NULL DEFAULT 'OTHER',
        "description" text NOT NULL,
        "status" "reports_status_enum" NOT NULL DEFAULT 'PENDING',
        "adminNotes" text,
        CONSTRAINT "PK_reports_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reports_reporterId" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reports_reportedUserId" FOREIGN KEY ("reportedUserId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reports_sessionId" FOREIGN KEY ("sessionId") REFERENCES "tutoring_sessions"("id") ON DELETE SET NULL
      );
      CREATE INDEX IF NOT EXISTS "IDX_reports_reporterId" ON "reports" ("reporterId");
      CREATE INDEX IF NOT EXISTS "IDX_reports_reportedUserId" ON "reports" ("reportedUserId");
    `);

    // notifications
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        "title" character varying(255) NOT NULL,
        "message" text NOT NULL,
        "type" "notifications_type_enum" NOT NULL DEFAULT 'SYSTEM',
        "metadata" jsonb,
        "isRead" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "IDX_notifications_userId" ON "notifications" ("userId");
      CREATE INDEX IF NOT EXISTS "IDX_notifications_isRead" ON "notifications" ("isRead");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reports";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "academic_materials";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "study_partner_matches";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "session_participants";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tutoring_sessions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "topics";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "courses";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "otp_codes";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);

    await queryRunner.query(`DROP TYPE IF EXISTS "notifications_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "reports_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "reports_reason_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "academic_materials_materialtype_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "study_partner_matches_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "tutoring_sessions_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "tutoring_sessions_locationtype_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "tutoring_sessions_sessiontype_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "topics_difficulty_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "otp_codes_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "users_role_enum";`);
  }
}
