# How the emulator works

`@effect-ak/tg-bot-emulator` is an in-memory implementation of a useful subset
of the Telegram Bot API (types of spec version 10.4). A bot built with
`@effect-ak/tg-bot` runs against it unchanged — same handlers, same polling
loop — because the emulator exposes a `TgBotClient`-compatible client and
implements `get_updates` with real long-poll semantics. Everything lives in
one process: no token, no network, works in Node and in the browser (the
website playground runs it inside a Web Worker).

## Module map

```
src/
  index.ts       public exports
  types.ts       public types: TgBotEmulator, EmulatorEvent, EmulatorDraft, …
  emulator.ts    assembly: identities, state, method table, client, user side
  state.ts       EmulatorState — the single mutable core (see below)
  client.ts      TgBotClient facade: dispatch, error mapping, getFile
  errors.ts      EmulatorApiError (code + message → NotOkResponse)
  text.ts        outgoing text: bot_command detection, parse_mode dispatch
  html.ts        HTML parse mode: tags → text + MessageEntity[]
  rich.ts        InputRichMessage → RichMessage (blocks passthrough, html→blocks)
  outgoing.ts    shared outgoing-message pieces: base fields, caption, reply
  api/           Bot API method handlers, grouped by domain
    updates.ts   get_updates (long poll, offset confirmation)
    messages.ts  send/edit/delete/forward/copy
    media.ts     send_photo/document/…/dice + get_file
    drafts.ts    send_message_draft, send_rich_message(_draft)
    chat.ts      chat actions, reactions, callback answers, get_me/get_chat
    widgets.ts   send_widget/send_shared_widget, answer_widget_query, widget data
```

Each `api/*.ts` exports a factory `(state) => { method_name: handler }`;
`emulator.ts` merges the tables and hands them to the client facade. The
merged table is typed against the generated `Api` (`MethodTable` in
`client.ts`): a handler whose input or result drifts from the real method's
signature does not compile.

## The state

`EmulatorState` (one instance per emulator) is the only mutable thing:

- `messages` — the chat history (both sides), mutated in place by edits
- `pendingUpdates` — updates queued for the bot, until confirmed via `offset`
- `activeDraft` — the currently streamed draft, or `null`
- `reactions` — message_id → emoji list set by the bot
- `uploads` — file_id → bytes for media sent with `file_content`
- listeners (the `EmulatorEvent` bus) and long-poll waiters

Everything observable goes through `state.emit(event)`; the public
`subscribe` / `nextEvent` / `nextBotMessage` are thin wrappers over the bus.

## The flows

**User → bot.** `emulator.sendMessage("/start")` builds a `Message` (with a
`bot_command` entity when the text starts with `/`), stores it in the history,
and pushes an `Update` into `pendingUpdates`. A `get_updates` call blocked in
a long poll is woken immediately — that is why a test never waits for the
next poll cycle. `tapButton` does the same with a `callback_query` update;
the button is looked up in the message's inline keyboard or in the
`buttons` blocks of its rich message (nested blocks included).

**Bot → chat.** Method handlers validate input (throwing `EmulatorApiError`
for API-shaped failures), mutate the state, emit events, and return exactly
what the real method returns (`Message`, `boolean`, …). The client facade
maps results into the `ClientResult` union: handler return → `{ ok: true }`,
`EmulatorApiError` → `NotOkResponse` with its code, anything else →
`ClientInternalError`, unknown method → `NotOkResponse` 404.

**Long poll.** `get_updates` first applies `offset` (confirmed updates are
dropped), then: queue non-empty → return immediately; empty with `timeout` →
park a waiter that either gets woken by the next `pushUpdate` or resolves
empty when the timeout elapses. This mirrors real Telegram closely enough
that the SDK's `UpdateFetcher` (fetch → handle → commit) works unchanged.

**Parse mode.** `parse_mode: "HTML"` is applied the way the real API does it:
tags are stripped and become `MessageEntity` ranges (offsets in UTF-16 code
units); `&lt;`-style entities are decoded; unknown tags stay literal text.
Supported tags: `b i u s code pre a tg-spoiler blockquote` (+ aliases),
`<pre language="…">` and `<pre><code class="language-…">` carry the language.

**Streaming drafts (Bot API 9.3+).** `send_message_draft` keeps at most one
`activeDraft`: empty text → `thinking: true` ("Thinking…"), repeated calls
replace the draft (`draft` event each time), and any real send finalizes it
(`draft_cleared`, then `message`). The real API's 30-second TTL is _not_
emulated — a draft lives until replaced or finalized, which is what tests
want.

**Rich messages (Bot API 10.1+).** `send_rich_message(_draft)` resolves
`InputRichMessage`: `blocks` pass through as-is (input blocks are
structurally the resolved blocks for our purposes), `html` is converted with
the same HTML parser — inline tags become RichText spans, `pre`/`blockquote`
become their own blocks — and `markdown` returns a 400.

**Widgets (Bot API 10.4).** `send_widget` stores the widget on the message
(`Message.widget`, marked `has_protected_content` as in production, so
`copy_message` and `forward_message` refuse it); what the server knows beyond
that — `allow_queries`, the shared widget id — lives in `widgetMeta`, and
shared widgets in `sharedWidgets`. `emulator.widgetRequest(message_id, data)`
plays the widget's `TelegramWidget.request()`: it pushes a `widget_query` and
resolves with what the widget would get — the bot's `answer_widget_query`
data, or `NOT_ALLOWED` / `BUSY` / `TIMEOUT` / `INVALID_ANSWER`. Its timeout
(15 s by default, as in Telegram) is the second timer in the emulator.
Changing a shared widget's public data rewrites every message that shows it.

**Files.** Media sent as `{ file_content, file_name }` is stored in
`uploads` under a minted `emu-file-N` id; `get_file` and `client.getFile`
then return the actual bytes. String inputs (existing file_id / URL) pass
through as stub descriptors.

## Design decisions

- **One private chat.** One user, one bot, one chat — covers the vast
  majority of bot logic. Groups/topics are out of scope for now (see
  [todo.md](todo.md)).
- **Faithful error shapes.** Failures come back as the same
  `ClientResult` union a real HTTP failure produces, so error-handling code
  is exercised, not bypassed.
- **Lenient where tests want it.** Unknown fields are ignored, `chat_id` is
  not strictly validated, drafts have no TTL. The emulator is a test double,
  not a validator.
- **No timers except the long poll and a widget request's timeout.**
  Everything else is synchronous, so tests are deterministic and fast;
  `nextEvent`/`nextBotMessage` add a rejection timeout (default 5 s) purely
  as a hang guard.
