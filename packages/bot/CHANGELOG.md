# @effect-ak/tg-bot

## 1.14.0

### Minor Changes

- 0a602de: `BotResponse.orElse(fallback)`: answer when Telegram refuses a call. If one of the response's calls fails, the rest of it is skipped and the fallback runs, given the client's error (`(error) => ctx.reply(...)`, or a plain response). Without it a failed call is only logged, as before. Calls inside `orElse` count for auto-answering, so a callback query answered there is not answered twice.

### Patch Changes

- @effect-ak/tg-bot-api@1.14.0
- @effect-ak/tg-bot-client@1.14.0

## 1.13.0

### Minor Changes

- 1fa538c: **`@effect-ak/tg-bot-api`** — `InputFile` accepts a `Blob` or `File` besides `{ file_content, file_name }`. The client always sent them; the type did not allow it.

  **`@effect-ak/tg-bot`** — New `parseWebhookRequest(request, secret_token?)`: verifies the secret token in constant time and reads the `Update`, returning `{ ok: true, update }` or `{ ok: false, status: 400 | 403, reason }`. `createWebhook` uses it; a router that dispatches updates itself (several bots behind one token) should too. A body that is not valid JSON now gets `400` instead of `500`.

  **`@effect-ak/tg-bot-emulator`** — Media sent as a `Blob` or `File` is stored with its bytes (a `File` keeps its name), so `get_file` round-trips it like `file_content` uploads.

- 27e26a1: Keep the update kind apart from its payload, and replace type assertions with checked types.

  **`@effect-ak/tg-bot`**

  - Fix: `poll`, `widget_query` and `shared_widget_query` updates never reached their handlers. The processor merged the update kind into the payload as `type`, and these payloads have a `type` field of their own, which overwrote it. Handlers now receive the payload exactly as Telegram sent it, with no `type` key added.
  - Fix: `ctx.answerCallbackQuery()` in a `widget_query` handler built an `answer_callback_query` call instead of throwing — a widget query was told apart from a callback query by its fields, which are the same.
  - The webhook handler answers `400` to a JSON body that is not an `Update` (no numeric `update_id`) instead of processing it.
  - Changed: `extractUpdate(update)` returns `{ type, payload }` instead of the payload with `type` mixed in. `createBotContext` and `resolveCallbackQueryId` take that extracted update; `resolveChatId` and `resolveMessageTarget` take a payload. Before, all four accepted `unknown`.
  - New exports: `AvailableUpdateTypes`, `UpdatePayload<K>`, `ExtractedUpdate<K>`. `BotApiCall` takes an optional method parameter (`BotApiCall<"send_message">`).
  - `ctx.call` and `BotResponse.call` accept an emoji for `message_effect_id`, like the client.

  **`@effect-ak/tg-bot-client`**

  - `getFile` builds base64 with `btoa` instead of `Buffer`, so `base64String()` works in browsers and Workers too.
  - New export: `MethodInput<M>` — the input of a method as `execute` / `executeSafe` accept it.

  **`@effect-ak/tg-bot-emulator`**

  - Fix: `get_chat` returned a `Chat`; it now returns a `ChatFullInfo` with the required fields filled in.
  - Fix: a bot command in an `html` rich message became a `RichTextBotCommand` without its required `bot_command` field.
  - `MethodTable` is typed against the generated `Api`, so every emulated method is checked against the real signature.
  - `nextEvent` narrows its result when the predicate is a type guard.

- 4e719dd: HTML widgets (Bot API 10.4).

  **`@effect-ak/tg-bot`**

  - `bot.onWidgetQuery(...)` and `bot.onSharedWidgetQuery(...)`, with a `data(pattern, handler)` helper like `onCallbackQuery`'s.
  - `ctx.answerWidgetQuery(data?)` answers the request; `ctx.editWidgetData({ chat_data, public_data })` changes the state of the widget the request came from.
  - A widget handler that responds without answering gets an empty `answer_widget_query` sent for it — as callback queries already do — so the widget does not end in `TIMEOUT`.
  - New export `resolveWidgetQueryId`.

  **`@effect-ak/tg-bot-emulator`**

  - `send_widget`, `send_shared_widget`, `answer_widget_query`, `edit_message_widget_data` and `edit_shared_widget_data`, with the documented size limits. Widget messages are protected content, as in production: `copy_message` and `forward_message` refuse them. A shared widget's public data changes in every message that shows it.
  - `emulator.widgetRequest(message_id, data, { timeout })` plays the widget's `TelegramWidget.request()`: it delivers a `widget_query` and resolves with the bot's answer, or with `NOT_ALLOWED`, `BUSY`, `TIMEOUT` or `INVALID_ANSWER`.
  - New events `widget_answered` and `widget_data_changed`.

### Patch Changes

- 4ccf2dc: The `send_*` shorthand (`BotResponse.make({ type: "message", … })`, `ctx.reply`, …) no longer sends its `type` key to Telegram as a parameter. For `send_poll`, whose own `type` parameter is `"quiz" | "regular"`, that sent `type=poll` and failed the call. The poll's own `type` cannot be set through the shorthand; use `ctx.call("send_poll", { … })` for a quiz.
- Updated dependencies [1fa538c]
- Updated dependencies [c08995c]
- Updated dependencies [6c01ac9]
- Updated dependencies [551c1d4]
- Updated dependencies [27e26a1]
  - @effect-ak/tg-bot-api@1.13.0
  - @effect-ak/tg-bot-client@1.13.0

## 1.12.0

### Minor Changes

- d4f9461: New package `@effect-ak/tg-bot-emulator`: an in-memory Telegram Bot API emulator
  for testing bots without a token or network. It implements `get_updates` with
  real long-poll semantics, messaging (send/edit/delete/forward/copy, HTML parse
  mode → entities), streaming drafts (`send_message_draft`, Bot API 9.3+), rich
  messages (`send_rich_message` / `send_rich_message_draft`, Bot API 10.1+),
  media methods with `get_file` round-trip for uploaded content, chat actions and
  reactions — and exposes a `TgBotClient`-compatible client. The virtual user can
  send text and media, tap buttons, edit own messages, react
  (`message_reaction`), and run the inline-mode round trip (`sendInlineQuery` →
  `answer_inline_query` → `chooseInlineResult`).

  `@effect-ak/tg-bot`: `bot.run()`, `runBot()`, and `createWebhook()` now accept a
  custom `client` (e.g. the emulator) as an alternative to `bot_token`. New
  `ctx.stream(source, options?)` streams the reply like an AI bot (Bot API 9.3+):
  a "Thinking…" placeholder, a `send_message_draft` per chunk, then a final
  `send_message`; accepts a string, an `Iterable<string>`, or an
  `AsyncIterable<string>` (e.g. an LLM token stream).

### Patch Changes

- @effect-ak/tg-bot-api@1.12.0
- @effect-ak/tg-bot-client@1.12.0

## 1.11.0

### Minor Changes

- 3e0de04: Re-export the lower-level packages under subpaths, so a project only needs one entry in `package.json`.

  ```typescript
  import { createBot } from "@effect-ak/tg-bot";
  import type { Message, Update } from "@effect-ak/tg-bot/api";
  import { makeTgBotClient } from "@effect-ak/tg-bot/client";

  // client-only projects
  import type { Api } from "@effect-ak/tg-bot-client/api";
  ```

  The subpaths re-export the same declarations rather than bundling copies of them, so `@effect-ak/tg-bot-api` and `@effect-ak/tg-bot-client` remain installable on their own and their types stay interchangeable with the ones reached through a subpath.

### Patch Changes

- Updated dependencies [bf7a7f8]
- Updated dependencies [3e0de04]
  - @effect-ak/tg-bot-api@1.11.0
  - @effect-ak/tg-bot-client@1.11.0

## 1.10.0

### Minor Changes

- 97174fe: - `createWebhook` / `.webhook()` accept `secret_token` and reject requests whose `X-Telegram-Bot-Api-Secret-Token` header is missing or different with `403`; a warning is logged when it is omitted. `handler.setWebhook(params)` registers the webhook with the same secret.
  - Handlers can respond with any Bot API method, not only `send_*`: new `ctx.answerCallbackQuery`, `ctx.editMessageText`, `ctx.editMessageReplyMarkup`, `ctx.deleteMessage`, `ctx.call(method, params)`, plus `BotResponse.call`, `BotResponse.all` and `.and()` for several calls per update.
  - `callback_query` handlers that respond without an explicit `answer_callback_query` get one sent automatically, so inline buttons never hang.
  - New `defineScreens(screens, options)` — declarative inline-keyboard navigation (screens as data, type-checked `next`, Back via parent or per-chat stack, `url`/`action` buttons, dynamic text, `onEnter` hook) installed via the new `bot.use(plugin)`.
  - `ctx.reply*` from a `callback_query` handler now sends to the chat of the tapped message (previously it was silently dropped).
  - Shortcuts `bot.command(cmd, handler)`, `bot.onText(handler)`, `bot.onCallback(pattern, handler)`; `.onXxx()` also accepts a single `{ match?, handle }` object.
  - Handlers may return an array of `BotResponse`s — executed in order, same as `BotResponse.all`.
  - Commands are matched case-insensitively and with the `@bot_name` suffix stripped, so `command("/start")` works in groups; `command("start")` without the slash is accepted too.
  - **Breaking:** the handler input field `update` was renamed to `payload` (`({ payload, ctx }) => …`) — it holds the typed `Message` / `CallbackQuery` / …, never the `Update` envelope, and the old name was misleading. Rename in place; nothing else changes.

### Patch Changes

- @effect-ak/tg-bot-api@1.10.0
- @effect-ak/tg-bot-client@1.10.0

## 1.9.0

### Patch Changes

- Updated dependencies [77ec5a6]
  - @effect-ak/tg-bot-api@1.9.0
  - @effect-ak/tg-bot-client@1.9.0

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

- Updated dependencies [79e2cc0]
  - @effect-ak/tg-bot-client@1.8.0
  - @effect-ak/tg-bot-api@1.8.0

## 1.7.0

### Patch Changes

- Updated dependencies [6c7ba8a]
  - @effect-ak/tg-bot-api@1.7.0
  - @effect-ak/tg-bot-client@1.7.0

## 1.6.0

### Patch Changes

- Updated dependencies [ac32302]
  - @effect-ak/tg-bot-api@1.6.0
  - @effect-ak/tg-bot-client@1.6.0

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
