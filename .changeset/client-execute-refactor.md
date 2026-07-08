---
"@effect-ak/tg-bot-client": minor
"@effect-ak/tg-bot": minor
---

Client API refactor: throwing `execute` and request timeouts

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
