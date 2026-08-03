import { definePlugin } from '@opoha/plugin-sdk';

import { S3StorageAdapter } from './s3-adapter.js';

export { S3StorageAdapter, resolveS3Bucket, assertValidS3Key } from './s3-adapter.js';
export type { S3StorageAdapterOptions } from './s3-adapter.js';

/**
 * Official S3-compatible storage plugin (Phase 9 E-01).
 * Registers a StorageAdapter with put/get/delete/getUrl shaped after the
 * S3 API. Live AWS SDK wiring is intentionally out of scope for this
 * scaffold — mirrors the storage-localfs pattern (ADR-0003).
 */
export default definePlugin({
  id: 'storage-s3',
  boot(ctx) {
    const adapter = new S3StorageAdapter({
      bucket: process.env.OPOHA_STORAGE_S3_BUCKET,
      region: process.env.OPOHA_STORAGE_S3_REGION,
      publicBaseUrl: process.env.OPOHA_STORAGE_S3_PUBLIC_URL,
    });
    ctx.registerStorageAdapter(adapter);
    ctx.registerGraphQL({
      name: 's3StorageBucket',
      kind: 'query',
      descriptor: {
        resolve: () => adapter.bucket,
      },
    });
    ctx.registerAdmin({
      navigation: [
        {
          id: 'storage-s3-nav',
          label: 'S3 Storage',
          path: '/plugins/storage-s3',
          permission: 'plugin:storage-s3:read',
        },
      ],
      settings: [
        {
          id: 'storage-s3-settings',
          title: 'S3 Storage',
          path: '/plugins/storage-s3/settings',
          permission: 'plugin:storage-s3:read',
        },
      ],
      permissions: ['plugin:storage-s3:read'],
    });
  },
});
