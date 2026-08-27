# Virtual Telegram Client for the Playground

## Goal

Let playground users interact with the bot they just wrote — directly in the browser,
in a chat-like UI — without creating a real bot via BotFather, without a token,
without webhooks or real Telegram at all.

The bot from the editor runs against an **in-memory mock of the Bot API**; a
**virtual chat panel** next to the editor plays the role of the Telegram client.

## Why it fits

Most of the infrastructure already exists:

- The bot already runs in the browser inside a Web Worker (`bot-worker.ts`):
  user code is compiled, loaded via a blob URL, and started with a real `bot.run()`
  long-polling loop.
- `makeTgBotClient` already supports a `base_url` override
  (`packages/client/src/client.ts`), so the transport can be swapped officially —
  no `fetch` monkey-patching required.
- Polling goes through `client.executeSafe("get_updates", ...)`
  (`packages/bot/src/polling.ts`), so a mock that implements `get_updates` with
  real long-poll waiting makes the whole bot loop work unchanged.

## The one real gap

`bot.run()` builds its client from the token only (`packages/bot/src/run.ts`)
and does not let the caller pass a custom client or transport. This must become
a first-class option (e.g. `client?: TgBotClient` or
`transport?: (method, params) => Promise<...>` in the run input).

Making it a proper SDK feature (an "in-memory mode") also gives users a test kit
for unit-testing their bots — not just a playground trick.

## Plan (MVP)

1. **SDK: transport injection.** Extend `bot.run()` input so a custom
   client/transport can be provided. Default behavior stays exactly as today.
2. **In-memory Bot API.** `makeInMemoryBotApi()` implementing:
   - `send_message`, `edit_message_text`, `edit_message_reply_markup`,
     `answer_callback_query`, `delete_message`
   - `get_updates` with real long-poll semantics (promise queue that resolves
     when a new update is pushed)
   - consistent `message_id` / `update_id` counters, a single virtual chat
3. **Playground: virtual chat panel.** An Alpine.js component next to the editor:
   - message bubbles for bot/user messages
   - text input → synthesizes an `Update` with a `message`
   - inline keyboard rendered from `reply_markup`; button tap → `callback_query`
   - start with plain text + inline keyboards; `parse_mode` rendering later
4. **Wiring.** The mock lives in the worker (same place as the bot); UI events
   travel over the existing `postMessage` channel. No token needed — the
   playground works instantly.
5. **Keep the real mode.** Connecting a real bot token stays available as a
   second mode; current behavior is not broken.

## Out of scope for MVP

- Media (photos, documents) — can later be stubbed with blob URLs via `getFile`
- Reply keyboards, `parse_mode` (HTML/MarkdownV2) rendering
- Multiple chats / group semantics
- Full Bot API surface — only the methods listed above

## Pitfalls to keep in mind

- Consistency of `message_id`, `chat_id`, `update_id` across the mock
- `answer_callback_query` must be emulated (the framework auto-answers
  callback queries, so the mock must accept it)
- Deciding later what to do with files (`getFile` → blob URL is enough)
