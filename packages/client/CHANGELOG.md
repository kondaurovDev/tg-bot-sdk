# @effect-ak/tg-bot-client

## 1.9.0

### Patch Changes

- Updated dependencies [77ec5a6]
  - @effect-ak/tg-bot-api@1.9.0

## 1.8.0

### Minor Changes

- 79e2cc0: Client API refactor: throwing `execute` and request timeouts

  Behavior changes in `@effect-ak/tg-bot-client`:

  - `execute` now returns the API result directly and throws `TgBotClientError` on failure. The previous non-throwing behavior is available as `executeSafe`, which returns a `ClientResult`.
  - `getFile` now returns `TgFile` directly and throws `TgBotClientError` on failure; the non-throwing variant is `getFileSafe`.
  - Fields with `0`, `false`, or empty-string values are no longer silently dropped from request payloads (only `null`/`undefined` are skipped).
  - An HTTP 200 response with `ok: false` in the body is now reported as `NotOkResponse` instead of being treated as success.

  New features:

  - Request timeouts: configurable via `timeout` (milliseconds, default 60000) in `makeTgBotClient` config and overridable per call via a third `options` argument (`{ timeout, signal }`). Timed-out requests fail with the new `RequestTimeout` error reason.
  - `AbortSignal` support per call.
  - `File` and `Blob` values are attached to multipart payloads as-is.
  - `TgBotClientError` and `unwrapClientResult` are exported.

  `@effect-ak/tg-bot` uses `executeSafe` internally and sets a long-polling-aware fetch timeout (`poll_timeout + 10s`) for `get_updates`.

### Patch Changes

- @effect-ak/tg-bot-api@1.8.0

## 1.7.0

### Patch Changes

- Updated dependencies [6c7ba8a]
  - @effect-ak/tg-bot-api@1.7.0

## 1.6.0

### Patch Changes

- Updated dependencies [ac32302]
  - @effect-ak/tg-bot-api@1.6.0

## 1.5.1

### Patch Changes

- dae0ed4: - Generated TypeScript types now carry JSDoc comments with field/method descriptions and `@see` links to the documentation site, improving IDE hover tooltips.
  - Publish a language-agnostic JSON spec (`bot-api.json`, `mini-app.json`) at the docs site for third-party codegen, with structured types (`primitive`/`ref`/`array`/`union`/`enum`/`object`) and auto-detected discriminators for tagged unions.
  - Internal codegen refactor: replaced `ts-morph` with a string-based emitter + Prettier; extracted a structured `SpecType` model; cleaned up overrides; various scraper bug fixes.
- Updated dependencies [dae0ed4]
  - @effect-ak/tg-bot-api@1.5.1

## 1.5.0

### Patch Changes

- Updated dependencies [6edcf09]
  - @effect-ak/tg-bot-api@1.5.0

## 1.4.2

### Patch Changes

- e86bf1b: feat(api): update to Telegram Bot API 9.5
- Updated dependencies [e86bf1b]
  - @effect-ak/tg-bot-api@1.3.3

## 1.4.1

### Patch Changes

- 8ac8abd: Add homepage, keywords, and update documentation links to tg-bot-sdk.website
- Updated dependencies [8ac8abd]
  - @effect-ak/tg-bot-api@1.3.1

## 1.4.0

### Minor Changes

- c5b9674: Replace thrown `TgBotClientError` with `ClientResult<T>` return type for all client methods

## 1.3.4

### Patch Changes

- 94774a9: chore: release packages
- Updated dependencies [94774a9]
  - @effect-ak/tg-bot-api@1.3.0

## 1.3.3

### Patch Changes

- 3c2bc12: Update to Bot API 9.4, fix version parser, use workspace protocol for internal deps
- Updated dependencies [3c2bc12]
  - @effect-ak/tg-bot-api@1.2.0

## 1.3.2

### Patch Changes

- 4c56173: Update Telegram Bot API to version 9.4
- Updated dependencies [4c56173]
  - @effect-ak/tg-bot-api@1.1.0
