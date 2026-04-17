# @effect-ak/tg-bot

## 1.5.1

### Patch Changes

- dae0ed4: - Generated TypeScript types now carry JSDoc comments with field/method descriptions and `@see` links to the documentation site, improving IDE hover tooltips.
  - Publish a language-agnostic JSON spec (`bot-api.json`, `mini-app.json`) at the docs site for third-party codegen, with structured types (`primitive`/`ref`/`array`/`union`/`enum`/`object`) and auto-detected discriminators for tagged unions.
  - Internal codegen refactor: replaced `ts-morph` with a string-based emitter + Prettier; extracted a structured `SpecType` model; cleaned up overrides; various scraper bug fixes.
- Updated dependencies [dae0ed4]
  - @effect-ak/tg-bot-api@1.5.1
  - @effect-ak/tg-bot-client@1.5.1

## 1.5.0

### Patch Changes

- Updated dependencies [6edcf09]
  - @effect-ak/tg-bot-api@1.5.0
  - @effect-ak/tg-bot-client@1.5.0

## 1.3.2

### Patch Changes

- e86bf1b: feat(api): update to Telegram Bot API 9.5
- Updated dependencies [e86bf1b]
  - @effect-ak/tg-bot-api@1.3.3
  - @effect-ak/tg-bot-client@1.4.2

## 1.3.1

### Patch Changes

- 8ac8abd: Add homepage, keywords, and update documentation links to tg-bot-sdk.website
- Updated dependencies [8ac8abd]
  - @effect-ak/tg-bot-api@1.3.1
  - @effect-ak/tg-bot-client@1.4.1

## 1.3.0

### Minor Changes

- c5b9674: Add `createBot()` fluent API for defining bot handlers

### Patch Changes

- Updated dependencies [c5b9674]
  - @effect-ak/tg-bot-client@1.4.0

## 1.2.4

### Patch Changes

- 94774a9: chore: release packages
- Updated dependencies [94774a9]
  - @effect-ak/tg-bot-api@1.3.0
  - @effect-ak/tg-bot-client@1.3.4

## 1.2.3

### Patch Changes

- 3c2bc12: Update to Bot API 9.4, fix version parser, use workspace protocol for internal deps
- Updated dependencies [3c2bc12]
  - @effect-ak/tg-bot-api@1.2.0
  - @effect-ak/tg-bot-client@1.3.3

## 1.2.2

### Patch Changes

- 4c56173: Update Telegram Bot API to version 9.4
- Updated dependencies [4c56173]
  - @effect-ak/tg-bot-api@1.1.0
  - @effect-ak/tg-bot-client@1.3.2
