---
"@effect-ak/tg-bot-api": patch
"@effect-ak/tg-bot-client": patch
"@effect-ak/tg-bot": patch
---

- Generated TypeScript types now carry JSDoc comments with field/method descriptions and `@see` links to the documentation site, improving IDE hover tooltips.
- Publish a language-agnostic JSON spec (`bot-api.json`, `mini-app.json`) at the docs site for third-party codegen, with structured types (`primitive`/`ref`/`array`/`union`/`enum`/`object`) and auto-detected discriminators for tagged unions.
- Internal codegen refactor: replaced `ts-morph` with a string-based emitter + Prettier; extracted a structured `SpecType` model; cleaned up overrides; various scraper bug fixes.
