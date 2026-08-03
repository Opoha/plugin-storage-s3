import { StorageS3SettingsEntity } from './storage-s3-settings.entity.js';

/** TypeORM entities owned by this plugin (ADR-0005). */
export const storageS3Entities = [StorageS3SettingsEntity] as const;

export { StorageS3SettingsEntity };
