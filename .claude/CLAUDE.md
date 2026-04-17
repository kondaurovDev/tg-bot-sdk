Write all code, comments, commit messages, and documentation in English.

Do not run `changeset version` or `changeset publish` locally. CI/CD handles building, versioning, and publishing via OIDC.

## Project overview

Monorepo (`pnpm workspaces`) with three npm packages under `@effect-ak/` scope:

- **`packages/api`** — Auto-generated TypeScript types for Telegram Bot API. Codegen scrapes official Telegram docs (node-html-parser) and emits `.ts` via a string-based emitter + prettier. Runs via Effect-ts. Two modules: `bot_api` and `webapp` (Mini Apps).
- **`packages/client`** — Lightweight HTTP client (`makeTgBotClient()`). Uses native `fetch`, zero runtime deps. Discriminated union results (`ok: true/false`), automatic FormData serialization, message effect emoji mapping.
- **`packages/bot`** — High-level bot framework. Fluent builder API (`createBot().onMessage(...).run()`), guarded handler pattern, long polling with offset management, webhook support.
- **`docs/`** — Astro + Starlight documentation site (https://tg-bot-sdk.website). Interactive playground (Alpine.js + Monaco Editor).
- **`example/`** — Example bots and Vercel webhook handler.

Dependency chain: `api` <- `client` <- `bot`.

## Key conventions

- TypeScript strict mode, ESNext target, ESM + CJS dual output via tsup.
- No semicolons, trailing commas (Prettier).
- Effect-ts is used ONLY in codegen (`packages/api/codegen/`), NOT in runtime packages.
- Native `fetch` everywhere, no external HTTP libraries.
- Error handling via tagged discriminated unions, not exceptions.
- Functional style: builder pattern, handler chaining, immutable data.
- Snake_case Telegram API method names (e.g. `send_message`) are converted to camelCase for HTTP paths internally.

## Build & test

```bash
pnpm build        # build all packages (includes codegen)
pnpm typecheck    # tsc --noEmit across all packages
pnpm test         # vitest across all packages
pnpm lint         # eslint + prettier check
```

CI: GitHub Actions, Node.js 24, pnpm 10. Release via changesets with npm provenance.
