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

Codegen reads the committed snapshot in `packages/api/input/`; only a refresh touches the network. From the repo root, exactly this spelling and with no `cd` in the same command (it is excluded from the sandbox in `.claude/settings.json`):

```bash
pnpm --filter @effect-ak/tg-bot-api gen:refresh   # download the pages into the snapshot, then generate
```

Sandboxed, the same run is `CODEGEN_REFRESH=true NODE_USE_ENV_PROXY=1 MODULE_NAME=bot_api node --import tsx ./codegen/main.ts` (then `MODULE_NAME=webapp`) from `packages/api`, with `core.telegram.org` allowed: Node's `fetch` ignores the sandbox proxy without `NODE_USE_ENV_PROXY=1`, and the `tsx` CLI cannot open its IPC pipe. A plain `gen` needs neither.

- The snapshot and the generated `src/specification/*.ts` are both committed: review the diff of the generated types — it is the update.
- Read the scraper warnings at the end of the run, then run the `api` tests: `test/scrape/spec-invariants.test.ts` flags new docs constructs the scraper misreads (unparsed type cells, `never` / `unknown`, missed enums, Mini Apps signatures). A type that fails to parse is fixed in `codegen/scrape/`, not in the generated files.

## 3. Rebuild and check

Packages resolve each other through `dist/`, so build in dependency order, then typecheck and test each:

```bash
for p in api client bot emulator; do (cd packages/$p && ../../node_modules/.bin/tsup); done
for p in api client bot emulator; do (cd packages/$p && ../../node_modules/.bin/tsc && ../../node_modules/.bin/vitest run); done
```

What usually breaks is not `api`:

- **A new update kind** appears in `bot` through the `Update` type with no code change there. Check that the processor really dispatches it by adding its case to `packages/bot/test/bot-builder.test.ts`, and that `resolveChatId` / `resolveMessageTarget` find its chat if it has one.
- **A method the emulator implements changed its signature**: `emulator` stops compiling, because its method table is typed against `Api`.
- **A required field turned optional** (`chat_id` in the `send*` methods in 10.4) surfaces wherever `bot` or `emulator` assumed it.
- **A renamed or removed type** is a breaking change for users of the package. No alias is added; the changeset says so.

Then `node_modules/.bin/oxlint` and `node_modules/.bin/oxfmt --check .`.

## 4. Record

- Tracked files codegen rewrites: the two version JSONs, the badges in `readme.md` and `packages/api/readme.md`, `apps/website/src/data/bot-api-stats.json`, the counts in `apps/website/src/content/docs/faq.mdx`.
- `packages/emulator/docs/todo.md` and `architecture.md` name the Bot API version the gap list is measured against — update them when the emulator catches up, not before.
- Changeset: `.changeset/bot-api-<major>-<minor>.md`, a `minor` bump for `@effect-ak/tg-bot-api`, the additions listed by area, renames and removals called out.
- Commit: `feat(api): update to Telegram Bot API <version>`, with the version step and the type and method counts in the body.
- Never run `changeset version` or `changeset publish`; CI releases.
