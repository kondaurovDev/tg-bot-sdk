---
paths:
  - "packages/api/**"
---

# `packages/api`: generated types

- Codegen (`codegen/`) scrapes the official Telegram docs (node-html-parser) and emits `.ts` through a string-based emitter + oxfmt. It runs on Effect-ts — the only place in the repo that does. Two modules: `bot_api` and `webapp` (Mini Apps).
- Codegen output is not tracked in git; `pnpm build` regenerates it from the live docs, in CI too. So a new Bot API release reaches CI on its next run whether or not anything was committed, and a type change upstream can break `bot` or `emulator` there first.
- Not tracked: `src/specification/` (`types.ts`, `api.ts`, `webapp.ts`), `input/` (cached HTML pages, 24 h TTL), and on the website `src/content/docs/api/types/`, `public/bot-api.json`, `public/mini-app.json`.
- Tracked, rewritten by codegen: `bot-api-version.json`, `mini-app-version.json`, the version badges in both readmes, `apps/website/src/data/bot-api-stats.json`, the type and method counts in `apps/website/src/content/docs/faq.mdx`.
- The generated types mirror Telegram one to one: no aliases for renamed or removed types. A rename upstream is a breaking change that the changeset describes.
- A scraper quirk is fixed in the scraper (`codegen/scrape/`, overrides in `overrides.ts`), never by editing generated files.
- Updating to a new Bot API version is the `bot-api-update` skill.
