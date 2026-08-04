# S3 Storage Plugin

Official `@opoha/plugin-storage-s3` — implements the Opoha files storage port on S3-compatible object storage.

## What it registers

- Storage adapter `storage-s3` (`put` / `get` / `delete` / `getUrl`)
- Admin settings + nav under `/plugins/storage-s3`

Bucket credentials and endpoint config belong in environment variables — never commit them.

## Load

```bash
pnpm install && pnpm build
export OPOHA_PLUGINS="$(pwd)"
```

Or add `@opoha/plugin-storage-s3` to an app’s `opoha.config.json` `"plugins"` array after `pnpm add @opoha/plugin-storage-s3`.

Core discovers plugins dynamically — it never statically imports this package.
