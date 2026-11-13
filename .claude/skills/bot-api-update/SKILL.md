---
name: bot-api-update
description: Update the SDK to a new Telegram Bot API (or Mini Apps) version — read the changelog, run codegen, rebuild and check every package, write the changeset and the commit. Use when Telegram ships a Bot API release, when asked what is new in the Bot API or whether the types are up to date, and when codegen or the build fails after an upstream docs change.
---

# Updating to a new Bot API version

The types in `packages/api` are generated from the live Telegram docs and are not tracked in git (see `.claude/rules/api.md` for the file list). The update itself is small; the work is finding what the new types break downstream.

## 1. Read before running anything

- Current version: `packages/api/bot-api-version.json` and `mini-app-version.json`.
- Changelog: https://core.telegram.org/bots/api-changelog (Mini Apps: the "Recent changes" block of https://core.telegram.org/bots/webapps). `curl` reaches both from the sandbox.
- Tell the author what changed, grouped by area, and what it touches in `bot`, `emulator` and the website — before touching files.

## 2. Generate

From the repo root, exactly this spelling and with no `cd` in the same command (it is excluded from the sandbox in `.claude/settings.json`):

```bash
pnpm --filter @effect-ak/tg-bot-api gen   # or gen:bot:api / gen:webapp:api
```

- Pages are cached in `packages/api/input/` for 24 h; `FORCE_REFRESH=true` refetches.
- Read the scraper warnings at the end of the run. A type that fails to parse is fixed in `codegen/scrape/`, not in the generated files.
- Codegen cannot run sandboxed: Node's `fetch` ignores the sandbox proxy (`ENOTFOUND`; `NODE_USE_ENV_PROXY=1` makes it use the proxy), the `tsx` CLI cannot open its IPC pipe (`node --import tsx <file>` works), and the emitter shells out to `pnpm exec oxfmt`.

## 3. Rebuild and check

Packages resolve each other through `dist/`, so build in dependency order, then typecheck and test each:

```bash
for p in api client bot emulator; do (cd packages/$p && ../../node_modules/.bin/tsup); done
for p in api client bot emulator; do (cd packages/$p && ../../node_modules/.bin/tsc && ../../node_modules/.bin/vitest run); done
```

What usually breaks is not `api`:

- **A new update kind** appears in `bot` through the `Update` type with no code change there. Check that the processor really dispatches it — add its case to `packages/bot/test/` — and look at the payload's own field names: one that clashes with what the processor adds or reads (`type` in `poll` and `widget_query`) breaks dispatch silently.
- **A required field turned optional** (`chat_id` in the `send*` methods in 10.4) surfaces wherever `bot` or `emulator` assumed it.
- **A renamed or removed type** is a breaking change for users of the package. No alias is added; the changeset says so.

Then `node_modules/.bin/oxlint` and `node_modules/.bin/oxfmt --check .`.

## 4. Record

- Tracked files codegen rewrites: the two version JSONs, the badges in `readme.md` and `packages/api/readme.md`, `apps/website/src/data/bot-api-stats.json`, the counts in `apps/website/src/content/docs/faq.mdx`.
- `packages/emulator/docs/todo.md` and `architecture.md` name the Bot API version the gap list is measured against — update them when the emulator catches up, not before.
- Changeset: `.changeset/bot-api-<major>-<minor>.md`, a `minor` bump for `@effect-ak/tg-bot-api`, the additions listed by area, renames and removals called out.
- Commit: `feat(api): update to Telegram Bot API <version>`, with the version step and the type and method counts in the body.
- Never run `changeset version` or `changeset publish`; CI releases.
