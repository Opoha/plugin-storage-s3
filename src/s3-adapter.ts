import type {
  StorageAdapter,
  StoragePutInput,
  StoragePutResult,
} from '@opoha/plugin-sdk';

/**
 * Resolves the configured bucket name.
 * Prefer explicit option; otherwise `OPOHA_STORAGE_S3_BUCKET`.
 */
export function resolveS3Bucket(
  explicitBucket?: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const fromEnv = env.OPOHA_STORAGE_S3_BUCKET?.trim();
  if (explicitBucket && explicitBucket.trim().length > 0) {
    return explicitBucket.trim();
  }
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }
  return 'opoha-storage';
}

/** Rejects keys that are empty or contain null bytes (S3 object key hygiene). */
export function assertValidS3Key(key: string): string {
  if (!key || key.trim().length === 0) {
    throw new Error('storage key is required');
  }
  if (key.includes('\0')) {
    throw new Error('storage key must not contain null bytes');
  }
  return key.replace(/^\/+/, '');
}

export type S3StorageAdapterOptions = {
  bucket?: string;
  region?: string;
  /** Optional base URL for getUrl (e.g. https://cdn.example.com). */
  publicBaseUrl?: string;
};

type StoredObject = { body: Uint8Array; contentType?: string };

/**
 * S3-compatible StorageAdapter stub — put/get/delete/getUrl against an
 * in-memory object map shaped like S3 semantics (bucket + key). No AWS SDK
 * dependency (Phase 9 E-01 scaffold only) — mirrors the stripe/omise stub
 * pattern (ADR-0003); live SDK wiring can replace the in-memory store
 * without changing engine contracts.
 */
export class S3StorageAdapter implements StorageAdapter {
  readonly code = 's3' as const;
  readonly bucket: string;
  readonly region?: string;
  readonly publicBaseUrl?: string;
  private readonly objects = new Map<string, StoredObject>();

  constructor(options: S3StorageAdapterOptions = {}) {
    this.bucket = resolveS3Bucket(options.bucket);
    this.region = options.region;
    this.publicBaseUrl = options.publicBaseUrl?.replace(/\/+$/, '');
  }

  async put(input: StoragePutInput): Promise<StoragePutResult> {
    const key = assertValidS3Key(input.key);
    this.objects.set(key, {
      body: input.body,
      contentType: input.contentType,
    });
    return { key, size: input.body.byteLength };
  }

  async get(key: string): Promise<Uint8Array> {
    const safeKey = assertValidS3Key(key);
    const object = this.objects.get(safeKey);
    if (!object) {
      throw new Error(`storage-s3: object not found for key "${safeKey}"`);
    }
    return object.body;
  }

  async delete(key: string): Promise<void> {
    const safeKey = assertValidS3Key(key);
    this.objects.delete(safeKey);
  }

  async getUrl(key: string): Promise<string | undefined> {
    const safeKey = assertValidS3Key(key);
    const encoded = safeKey
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl}/${encoded}`;
    }
    const region = this.region ?? 'us-east-1';
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${encoded}`;
  }
}
