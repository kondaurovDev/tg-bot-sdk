Write all code, comments, commit messages, and documentation in English.

Do not run `changeset version` or `changeset publish` locally. CI/CD handles building, versioning, and publishing via OIDC.

## Project overview

Monorepo (`pnpm workspaces`) with three npm packages under `@effect-ak/` scope:

- **`packages/api`** — Auto-generated TypeScript types for Telegram Bot API. Codegen scrapes official Telegram docs (node-html-parser) and emits `.ts` via a string-based emitter + oxfmt. Runs via Effect-ts. Two modules: `bot_api` and `webapp` (Mini Apps).
- **`packages/client`** — Lightweight HTTP client (`makeTgBotClient()`). Uses native `fetch`, zero runtime deps. Discriminated union results (`ok: true/false`), automatic FormData serialization, message effect emoji mapping.
- **`packages/bot`** — High-level bot framework. Fluent builder API (`createBot().command("/start", h).onText(h).onCallback(data, h)` shortcuts, `.onMessage(({ command, text, fallback }) => [...])` for ordered handler lists), guarded handler pattern, handlers receive `{ payload, ctx }` (`payload` = typed `Message`/`CallbackQuery`, not `Update`), long polling with offset management, webhook support with secret token verification, `defineScreens` (inline-keyboard navigation as data, `src/screens.ts`), `bot.use(plugin)`. Handlers return `BotResponse` (a list of API calls); the processor executes them and auto-answers callback queries.
- **`apps/website/`** — Astro + Starlight documentation site (https://tg-bot-sdk.website). Interactive playground (Alpine.js + Monaco Editor). `/llms.txt` and `/llms-full.txt` are generated from the guide pages by `src/pages/llms*.txt.ts`.
- **`apps/example/`** — Live demo: a Cloudflare Worker (`src/worker.ts`) hosting several demo bots (`src/bots/`) behind one bot token, switched via an inline menu with per-chat state in KV. Deployed by `.github/workflows/deploy-demo.yml`. `src/polling/` runs the same bots locally with long polling. `Makefile` wraps local dev (`wrangler dev`, tunnel, set-webhook).

- **`docs/`** — Local markdown notes and plans (not published; the website lives in `apps/website/`).

Dependency chain: `api` <- `client` <- `bot`.

## Key conventions

- TypeScript strict mode, ESNext target, ESM + CJS dual output via tsup.
- No semicolons, no trailing commas (oxfmt).
- Effect-ts is used ONLY in codegen (`packages/api/codegen/`), NOT in runtime packages.
- Native `fetch` everywhere, no external HTTP libraries.
- Error handling via tagged discriminated unions, not exceptions.
- Functional style: builder pattern, handler chaining, immutable data.
- Snake_case Telegram API method names (e.g. `send_message`) are converted to camelCase for HTTP paths internally.
- Webhook handlers must support `secret_token`; never add code paths that process updates without it being verifiable.
- In sandboxed shells call binaries directly (`node_modules/.bin/tsc`, `vitest`, `oxfmt`, `oxlint`, `tsup`) — `pnpm exec` may trigger an auto-install that cannot complete there.

## Build & test

```bash
pnpm build        # build all packages (includes codegen)
pnpm typecheck    # tsc --noEmit across all packages
pnpm test         # vitest across all packages
pnpm lint         # oxlint
pnpm format:check # oxfmt check (pnpm format to write)
```

CI: GitHub Actions, Node.js 24, pnpm 10. Release via changesets with npm provenance.
