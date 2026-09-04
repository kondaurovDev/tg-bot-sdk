# @effect-ak/tg-bot-emulator

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
