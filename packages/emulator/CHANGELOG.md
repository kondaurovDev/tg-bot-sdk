# @effect-ak/tg-bot-emulator

## 1.13.0

### Minor Changes

- 1fa538c: **`@effect-ak/tg-bot-api`** — `InputFile` accepts a `Blob` or `File` besides `{ file_content, file_name }`. The client always sent them; the type did not allow it.

  **`@effect-ak/tg-bot`** — New `parseWebhookRequest(request, secret_token?)`: verifies the secret token in constant time and reads the `Update`, returning `{ ok: true, update }` or `{ ok: false, status: 400 | 403, reason }`. `createWebhook` uses it; a router that dispatches updates itself (several bots behind one token) should too. A body that is not valid JSON now gets `400` instead of `500`.

  **`@effect-ak/tg-bot-emulator`** — Media sent as a `Blob` or `File` is stored with its bytes (a `File` keeps its name), so `get_file` round-trips it like `file_content` uploads.

- 7188466: Bot profile methods: `get_my_name` / `set_my_name`, `get_my_description` / `set_my_description`, `get_my_short_description` / `set_my_short_description`, `get_my_commands` / `set_my_commands`. Also `set_my_profile_photo` / `remove_my_profile_photo` (the upload round-trips through `get_file`) and `get_user_profile_photos` for the bot itself. The profile survives `reset()`; `language_code` and command `scope` are accepted and ignored.
- 68d0056: What a client UI needs to show the chat as Telegram does:

  - `set_my_commands` emits `commands_changed` with the new list (the Menu button).
  - A reply keyboard is the chat's, not the message's, as in Telegram (`Message.reply_markup` is inline only): sending one emits `reply_keyboard` with it, `remove_keyboard` emits `reply_keyboard` with `null`, and `emulator.replyKeyboard` holds the current one. `reset()` clears it.

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

- 2f6c495: The bot's edits (`edit_message_text`, `edit_message_caption`, `edit_message_reply_markup`) stamp `edit_date` on the message, as Telegram does; only the user's edits did.
- cfe9d67: `chooseInlineResult` sends the result as Telegram does: its `parse_mode` or `entities` apply, the message has `via_bot`, and the result's inline keyboard comes with it. Before, the text went out raw, as if the user had typed it.
- 1762ad4: `tapButton` finds buttons of rich messages: `callback_data` in a `buttons` block, including blocks nested in quotations, details, collages and list items. Before, only `reply_markup.inline_keyboard` was searched, so tapping a rich message's button threw.
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
