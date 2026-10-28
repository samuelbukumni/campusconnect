import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGenderToUsers1730000000001 implements MigrationInterface {
  name = 'AddGenderToUsers1730000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_gender_enum') THEN
          CREATE TYPE "users_gender_enum" AS ENUM('MALE', 'FEMALE');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender" "users_gender_enum";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "gender";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "users_gender_enum";`);
  }
}
