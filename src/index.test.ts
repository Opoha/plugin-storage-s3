import { describe, expect, it, vi } from 'vitest';

import { MIGRATIONS_TABLE_NAME, PLUGIN_ID, entities, migrations } from './database.js';
import storageS3 from './index.js';
import { S3StorageAdapter, assertValidS3Key, resolveS3Bucket } from './s3-adapter.js';
import { StorageS3Init1722800100000 } from './migrations/1722800100000-StorageS3Init.js';

function createQueryRunnerMock() {
  const queries: string[] = [];
  return {
    queries,
    query: vi.fn(async (sql: string) => {
      queries.push(sql);
    }),
  };
}

describe('@opoha/plugin-storage-s3', () => {
  it('exports definePlugin definition with storage-s3 id', () => {
    expect(storageS3.id).toBe('storage-s3');
    expect(typeof storageS3.boot).toBe('function');
  });

  it('registers storage adapter, GraphQL, and admin via boot context', () => {
    const adapters: Array<{ code: string }> = [];
    const graphql: Array<{ name: string; kind: string }> = [];
    const admin: unknown[] = [];

    storageS3.boot?.({
      pluginId: 'storage-s3',
      registerGraphQL(input) {
        graphql.push({ name: input.name, kind: input.kind });
      },
      registerProvider() {},
      registerListener() {},
      registerAdmin(contribution) {
        admin.push(contribution);
      },
      registerPaymentProvider() {},
      registerShippingMethod() {},
      registerStorageAdapter(adapter) {
        adapters.push({ code: adapter.code });
      },
      registerTaxProvider() {},
      registerPromotionRuleProvider() {},
      registerNotificationProvider() {},
      registerSearchProvider() {},
      registerFXProvider() {},
      registerScheduledJob() {},
      registerRuleAction() {},
    });

    expect(adapters).toEqual([{ code: 's3' }]);
    expect(graphql).toEqual([{ name: 's3StorageBucket', kind: 'query' }]);
    expect(admin).toHaveLength(1);
  });

  it('resolves bucket from env and rejects invalid keys', () => {
    expect(resolveS3Bucket(undefined, { OPOHA_STORAGE_S3_BUCKET: 'my-bucket' })).toBe('my-bucket');
    expect(resolveS3Bucket(undefined, {})).toBe('opoha-storage');
    expect(() => assertValidS3Key('')).toThrow(/storage key is required/);
    expect(() => assertValidS3Key('a\0b')).toThrow(/null bytes/);
  });

  it('puts, gets, deletes, and builds URLs against the in-memory object map', async () => {
    const adapter = new S3StorageAdapter({
      bucket: 'test-bucket',
      region: 'eu-west-1',
    });
    const body = new TextEncoder().encode('hello-opoha');
    const put = await adapter.put({
      key: 'orders/receipt.txt',
      body,
      contentType: 'text/plain',
    });
    expect(put).toEqual({ key: 'orders/receipt.txt', size: body.byteLength });

    const got = await adapter.get('orders/receipt.txt');
    expect(new TextDecoder().decode(got)).toBe('hello-opoha');

    const url = await adapter.getUrl('orders/receipt.txt');
    expect(url).toBe('https://test-bucket.s3.eu-west-1.amazonaws.com/orders/receipt.txt');

    await adapter.delete('orders/receipt.txt');
    await expect(adapter.get('orders/receipt.txt')).rejects.toThrow(/object not found/);
  });

  it('uses publicBaseUrl for getUrl when configured', async () => {
    const adapter = new S3StorageAdapter({
      bucket: 'test-bucket',
      publicBaseUrl: 'https://cdn.example.com',
    });
    await adapter.put({ key: 'a/b.txt', body: new Uint8Array([1, 2, 3]) });
    expect(await adapter.getUrl('a/b.txt')).toBe('https://cdn.example.com/a/b.txt');
  });

  it('exposes plugin-owned entities and namespaced migrations table', () => {
    expect(PLUGIN_ID).toBe('storage-s3');
    expect(MIGRATIONS_TABLE_NAME).toBe('opoha_migrations_storage_s3');
    expect(entities).toHaveLength(1);
    expect(migrations).toHaveLength(1);
    expect(migrations[0]).toBe(StorageS3Init1722800100000);
  });

  it('migration up/down owns only storage_s3_settings', async () => {
    const migration = new StorageS3Init1722800100000();
    const upRunner = createQueryRunnerMock();
    await migration.up(upRunner as never);
    expect(upRunner.queries.join('\n')).toContain('CREATE TABLE "storage_s3_settings"');
    expect(upRunner.queries.join('\n')).not.toMatch(/ALTER TABLE "(users|roles|files)"/i);

    const downRunner = createQueryRunnerMock();
    await migration.down(downRunner as never);
    expect(downRunner.queries.join('\n')).toContain('DROP TABLE IF EXISTS "storage_s3_settings"');
  });
});
