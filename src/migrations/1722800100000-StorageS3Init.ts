import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial settings table for S3 storage plugin (ADR-0005).
 * Table prefix: plugin id `storage-s3` → `storage_s3_*`.
 * Object bytes live in the bucket; this table only stores optional config.
 */
export class StorageS3Init1722800100000 implements MigrationInterface {
  name = 'StorageS3Init1722800100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "storage_s3_settings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "bucket" text,
        "region" text,
        "public_base_url" text,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "storage_s3_settings_pkey" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "storage_s3_settings"`);
  }
}
