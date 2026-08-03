import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** OWNER: @opoha/plugin-storage-s3 — settings for bucket/region (ADR-0005). */
@Entity({ name: 'storage_s3_settings' })
export class StorageS3SettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'bucket', type: 'text', nullable: true })
  bucket!: string | null;

  @Column({ name: 'region', type: 'text', nullable: true })
  region!: string | null;

  @Column({ name: 'public_base_url', type: 'text', nullable: true })
  publicBaseUrl!: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
