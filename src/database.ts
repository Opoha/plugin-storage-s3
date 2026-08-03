import 'reflect-metadata';

/**
 * Plugin-owned TypeORM surface for CLI / host migration aggregation (ADR-0005).
 * Core never imports this package statically — hosts load via dynamic import.
 */

import { StorageS3SettingsEntity } from './entities/storage-s3-settings.entity.js';
import { storageS3Entities } from './entities/index.js';
import { StorageS3Init1722800100000 } from './migrations/1722800100000-StorageS3Init.js';
import { storageS3Migrations } from './migrations/index.js';

export const PLUGIN_ID = 'storage-s3' as const;

/** Namespaced migrations table — never shares core `migrations`. */
export const MIGRATIONS_TABLE_NAME = 'opoha_migrations_storage_s3' as const;

export const entities = storageS3Entities;
export const migrations = storageS3Migrations;

export {
  StorageS3SettingsEntity,
  StorageS3Init1722800100000,
  storageS3Entities,
  storageS3Migrations,
};
