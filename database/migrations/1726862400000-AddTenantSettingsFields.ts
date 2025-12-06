import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTenantSettingsFields1726862400000 implements MigrationInterface {
  name = 'AddTenantSettingsFields1726862400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tenants" 
      ADD COLUMN "phone" varchar(20),
      ADD COLUMN "website" varchar(255),
      ADD COLUMN "address" text,
      ADD COLUMN "timezone" varchar(100),
      ADD COLUMN "maxUsers" integer,
      ADD COLUMN "enabledFeatures" text
    `);

    // Set default maxUsers to 100 for existing tenants
    await queryRunner.query(`
      UPDATE "tenants" 
      SET "maxUsers" = 100 
      WHERE "maxUsers" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tenants" 
      DROP COLUMN "phone",
      DROP COLUMN "website", 
      DROP COLUMN "address",
      DROP COLUMN "timezone",
      DROP COLUMN "maxUsers",
      DROP COLUMN "enabledFeatures"
    `);
  }
}