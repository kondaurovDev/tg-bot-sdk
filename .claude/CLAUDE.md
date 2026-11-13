Write all code, comments, commit messages, and documentation in English.

Do not run `changeset version` or `changeset publish` locally. CI/CD handles building, versioning, and publishing via OIDC.

## Project overview

Monorepo (`pnpm workspaces`); the npm packages are published under the `@effect-ak/` scope.

- **`packages/api`** — TypeScript types for the Telegram Bot API and Mini Apps, generated from the official docs.
- **`packages/client`** — Lightweight HTTP client (`makeTgBotClient()`). Native `fetch`, zero runtime deps, discriminated union results (`ok: true/false`), automatic FormData serialization, message effect emoji mapping.
- **`packages/bot`** — High-level bot framework: builder API, guarded handlers, long polling, webhooks, `defineScreens`.
- **`packages/emulator`** — In-memory Bot API for tests and the playground's virtual mode.
- **`packages/emulator-react`** — React chat UI over the emulator (`<Chat>`, `<PhoneFrame>`), talking to it through an `EmulatorPort`. Private for now.
- **`packages/playground`** — The website's playground as a React component (Monaco, the bot worker, the console, the examples). Private, never published.
- **`apps/website/`** — Astro + Starlight documentation site (https://tg-bot-sdk.website); mounts the playground on `/playground`.
- **`apps/example/`** — Live demo: a Cloudflare Worker hosting several demo bots.
- **`docs/`** — Local markdown notes and plans (not published).

Dependency chain: `api` <- `client` <- `bot`; `emulator` depends on `api` and `client` (`bot` only in its tests); `emulator-react` on `api` and `emulator`; `playground` on all of them. Packages resolve each other through `dist/`, so a change in one is visible to the next only after it is rebuilt — except `playground`, which the website compiles from source (its worker and Monaco need the website's Vite).

The details of each package and app load from `.claude/rules/` when you touch its files. Updating to a new Bot API version is the `bot-api-update` skill.

## Key conventions

- TypeScript strict mode, ESNext target, ESM + CJS dual output via tsup.
- No semicolons, no trailing commas (oxfmt).
- Effect-ts is used ONLY in codegen (`packages/api/codegen/`), NOT in runtime packages.
- Native `fetch` everywhere, no external HTTP libraries.
- Error handling via tagged discriminated unions, not exceptions.
- No type assertions (`as`), `any` or non-null `!` in `packages/*/src` — oxlint enforces it. Reach for narrowing (`in`, type guards), a function generic in the key, or a real runtime check first. The few assertions the compiler cannot do without carry an `oxlint-disable-next-line` and a comment saying why; a new one needs the same.
- Functional style: builder pattern, handler chaining, immutable data.
- Snake_case Telegram API method names (e.g. `send_message`) are converted to camelCase for HTTP paths internally.
- Webhook handlers must support `secret_token`; never add code paths that process updates without it being verifiable. Code that receives webhook requests outside `createWebhook` (a router for several bots) goes through `parseWebhookRequest` and refuses to run without a secret.

## Build & test

```bash
pnpm build        # build all packages (includes codegen)
pnpm typecheck    # tsc --noEmit across all packages
pnpm test         # vitest across all packages
pnpm lint         # oxlint
pnpm format:check # oxfmt check (pnpm format to write)
```

CI: GitHub Actions, Node.js 24, pnpm at the version pinned in `packageManager`; actions pinned to commit SHAs (`pinact run`, config `.github/pinact.yml`). Build checks generated files, format, lint, types, tests and pins. Release (changesets, npm provenance) and Deploy Demo run after a green Build of `main`; the website deploys from Release, once packages are published.

## Sandbox and guarded commands

- Bash runs sandboxed. Call binaries directly — `node_modules/.bin/tsc`, `vitest`, `oxfmt`, `oxlint`, `tsup` (from a package directory: `../../node_modules/.bin/…`); `pnpm exec`, `pnpm dlx` and `npx` may start an install that cannot complete there.
- `pnpm build` and codegen need the network and run outside the sandbox only in the spellings listed in `.claude/settings.json`, from the repo root with no `cd` in the same command.
- Dependencies are installed by the author. When `node_modules` is missing, say so and ask for `pnpm install` instead of running it.
- `.claude/hooks/guard.ts` asks before deploys, releases, calls to the live bot, `git push` and history rewrites, dependency changes and package runners. Deploys and releases are CI's job; push only on an explicit ask.
