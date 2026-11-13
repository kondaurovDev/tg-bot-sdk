---
paths:
  - "packages/api/**"
---

# `packages/api`: generated types

- Codegen (`codegen/`) scrapes the official Telegram docs (node-html-parser) and emits `.ts` through a string-based emitter + oxfmt. It runs on Effect-ts — the only place in the repo that does. Two modules: `bot_api` and `webapp` (Mini Apps).
- Codegen reads a committed snapshot of the docs, `input/api.html` and `input/webapp.html`, and never the network — so every build, the release build included, generates exactly the committed types. `gen:refresh` (`CODEGEN_REFRESH=true`) downloads the live pages into the snapshot; it strips Telegram's `<!-- page generated in … -->` stamp so the snapshot changes only when the docs do.
- Tracked: the snapshot, `src/specification/` (`types.ts`, `api.ts`, `webapp.ts`), `bot-api-version.json`, `mini-app-version.json`, the version badges in both readmes, `apps/website/src/data/bot-api-stats.json`, the counts in `apps/website/src/content/docs/faq.mdx`. CI runs `git diff --exit-code` after the build: a codegen change without a regeneration fails it.
- Not tracked (build artifacts derived from the snapshot): on the website `src/content/docs/api/types/`, `public/bot-api.json`, `public/mini-app.json`.
- The generated types mirror Telegram one to one: no aliases for renamed or removed types. A rename upstream is a breaking change that the changeset describes.
- A scraper quirk is fixed in the scraper (`codegen/scrape/`, overrides in `overrides.ts`), never by editing generated files.
- `test/scrape/spec-invariants.test.ts` checks the whole generated spec against the snapshot — no `never` / `unknown` types, every docs type cell parses, every override is still needed, Mini Apps signatures match the docs, enums are not missed. A failure names the fix; an exception goes into that test's allowlist with a reason.
- Updating to a new Bot API version is the `bot-api-update` skill.
