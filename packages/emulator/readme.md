# @effect-ak/tg-bot-emulator

In-memory Telegram Bot API emulator. Test bots built with
[`@effect-ak/tg-bot`](https://www.npmjs.com/package/@effect-ak/tg-bot) without a
token, network, or BotFather — the whole Bot API round trip happens in memory,
in Node or in the browser.

```ts
import { createBot } from "@effect-ak/tg-bot"
import { makeTgBotEmulator } from "@effect-ak/tg-bot-emulator"

const emulator = makeTgBotEmulator()

const bot = await createBot()
  .command("/start", ({ ctx }) => ctx.reply("Hello!"))
  .run({ client: emulator.client })

emulator.sendMessage("/start")

const reply = await emulator.nextBotMessage()
console.log(reply.text) // "Hello!"

bot.stop()
```

## What it emulates

A single virtual private chat between one user and the bot, plus the Bot API
surface a typical bot needs:

- `get_updates` — with real long-poll semantics (a pending call resolves the
  moment an update is pushed) and offset-based confirmation
- **Messaging** — `send_message`, `edit_message_text`, `edit_message_caption`,
  `edit_message_reply_markup`, `delete_message(s)`, `forward_message`,
  `copy_message`, `reply_parameters`, `parse_mode: "HTML"` → real `entities`
- **Streaming drafts** (Bot API 9.3+) — `send_message_draft` with the
  "Thinking…" placeholder and animated draft updates; sending a message
  finalizes the draft
- **Rich messages** (Bot API 10.1+) — `send_rich_message` and
  `send_rich_message_draft`: `blocks` pass through, `html` is converted to
  blocks; `edit_message_text` accepts `rich_message` too
- **Media** — `send_photo/document/video/audio/voice/animation/sticker/dice/location/contact`;
  uploaded `file_content` payloads round-trip through `get_file` /
  `client.getFile`
- **Chat-level** — `send_chat_action`, `set_message_reaction`,
  `answer_callback_query`, `get_me`, `get_chat`

Unknown methods return a regular `NotOkResponse` client error, so bots degrade
the same way they would against the real API.

## Observing drafts, actions, and reactions

```ts
emulator.draft // current streamed draft (or null)
emulator.reactions // reactions by message id
emulator.subscribe((event) => {}) // + draft / draft_cleared / chat_action / reactions
```

## Acting as the user

```ts
emulator.sendMessage("/help")        // delivers a `message` update
emulator.tapButton("color:red")      // taps an inline button → `callback_query` update
emulator.sendPhoto(file)             // media updates; bytes round-trip via getFile
emulator.sendDocument(file, { caption: "notes" })
emulator.editMessage(id, "fixed")    // → `edited_message` update
emulator.react(id, "👍")             // → `message_reaction` update (null clears)
emulator.sendInlineQuery("cats")     // → `inline_query`; bot answers…
emulator.chooseInlineResult("r1")    // …→ `chosen_inline_result` + chat message
emulator.pushUpdate({ ... })         // escape hatch: deliver any update
```

## Observing the chat

```ts
emulator.messages // chat history snapshot
emulator.subscribe((event) => {}) // message / message_edited / message_deleted / callback_answered
await emulator.nextBotMessage() // wait for the bot's next message
await emulator.nextEvent((e) => e.type === "callback_answered")
```

## Docs

- Guides and the interactive playground: https://tg-bot-sdk.website
- [docs/architecture.md](https://github.com/kondaurovDev/tg-bot-sdk/blob/main/packages/emulator/docs/architecture.md)
  — module map and how the emulator works inside
- [docs/todo.md](https://github.com/kondaurovDev/tg-bot-sdk/blob/main/packages/emulator/docs/todo.md)
  — known gaps against Bot API 10.3
