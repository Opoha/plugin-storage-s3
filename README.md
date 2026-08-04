# S3 Storage Plugin

Official [`@opoha/plugin-storage-s3`](https://www.npmjs.com/package/@opoha/plugin-storage-s3) — S3-compatible object storage adapter plugin.

| | |
| --- | --- |
| npm | `@opoha/plugin-storage-s3` |
| Plugin id | `storage-s3` |
| Contract | `0.1` |
| Repo | [Opoha/plugin-storage-s3](https://github.com/Opoha/plugin-storage-s3) |

## Install

```bash
pnpm add @opoha/plugin-storage-s3
```

Add the package to your app `opoha.config.json` `"plugins"` array (or set `OPOHA_PLUGINS` / `OPOHA_PLUGINS_PATH` for a local checkout).

## What it registers

- Storage adapter `s3` (`put` / `get` / `delete` / `getUrl` stubs)
- Admin / env config for bucket + region

Credentials belong in environment variables — never persist them in admin config JSON.

## Load (local checkout)

```bash
pnpm install && pnpm build
export OPOHA_PLUGINS="$(pwd)"
```

Core discovers plugins dynamically and imports `dist/index.js` — **core never statically imports this package**.

## Develop

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
```

## License

MIT © [Opoha](https://github.com/Opoha)
