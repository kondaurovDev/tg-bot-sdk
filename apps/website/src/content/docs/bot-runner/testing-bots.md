---
title: Testing Bots
description: Unit-test your bot with the in-memory Bot API emulator — no token, no network
---

The `@effect-ak/tg-bot-emulator` package is an in-memory Telegram Bot API
emulator. Your bot runs against it unchanged — same handlers, same polling
loop — but every API call stays in memory: no token, no network, no BotFather.
It works in Node and in the browser (the [playground](/playground/) uses it
for its virtual chat).

```bash
npm install -D @effect-ak/tg-bot-emulator
```

## Quick Start

Pass the emulator's client to `bot.run()` instead of a token:

```typescript
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

## A Complete Test

A vitest example covering a command, an inline keyboard, and a callback query:

```typescript
import { describe, expect, it } from "vitest"
import { createBot } from "@effect-ak/tg-bot"
import { makeTgBotEmulator } from "@effect-ak/tg-bot-emulator"

const makeBot = () =>
  createBot()
    .command("/start", ({ ctx }) =>
      ctx.reply("Pick a color", {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Red", callback_data: "color:red" },
              { text: "Blue", callback_data: "color:blue" }
            ]
          ]
        }
      })
    )
    .onCallback(/^color:/, ({ payload, ctx }) =>
      ctx.editMessageText(`You picked ${payload.data!.split(":")[1]}`)
    )

describe("color bot", () => {
  it("replies to /start and reacts to a button tap", async () => {
    const emulator = makeTgBotEmulator()
    const instance = await makeBot().run({ client: emulator.client })

    try {
      emulator.sendMessage("/start")
      const menu = await emulator.nextBotMessage()
      expect(menu.text).toBe("Pick a color")

      const edited = emulator.nextEvent((e) => e.type === "message_edited")
      emulator.tapButton("color:red")
      await edited

      expect(emulator.messages.at(-1)?.text).toBe("You picked red")
    } finally {
      instance.stop()
    }
  })
})
```

## Acting as the User

```typescript
emulator.sendMessage("/help")   // delivers a `message` update; "/..." gets a bot_command entity
emulator.tapButton("color:red") // taps an inline button → `callback_query` update
emulator.pushUpdate({ ... })    // escape hatch: deliver any update object
```

`tapButton` finds the latest message whose inline keyboard has a button with
that `callback_data` (pass `{ message_id }` to target a specific message) and
throws if none exists — so a broken keyboard fails the test early.

## Observing the Chat

```typescript
emulator.messages // chat history snapshot, oldest first
await emulator.nextBotMessage() // resolves with the bot's next message
await emulator.nextEvent((e) => e.type === "callback_answered")

const unsubscribe = emulator.subscribe((event) => {
  // "message" | "message_edited" | "message_deleted" | "callback_answered"
})
```

`nextBotMessage` and `nextEvent` reject after 5 seconds by default
(`{ timeout }` overrides it), so a bot that never answers fails the test
instead of hanging it.

## What Is Emulated

The emulator deliberately models **one private 1:1 chat** between one user and
the bot — the mode most bots are built and tested in first. Groups, channels,
and topics are not modeled. Inside that chat, the methods a typical bot loop
needs:

| Area             | Methods                                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Updates          | `get_updates` with real long-poll semantics: a pending call resolves the moment an update is pushed; `offset` confirms updates                               |
| Messaging        | `send_message`, `edit_message_text`, `edit_message_caption`, `edit_message_reply_markup`, `delete_message(s)`, `forward_message`, `copy_message`             |
| Streaming drafts | `send_message_draft` (Bot API 9.3+): "Thinking…" placeholder, animated updates; any sent message finalizes the draft                                         |
| Rich messages    | `send_rich_message`, `send_rich_message_draft` (Bot API 10.1+): `blocks` pass through, `html` converts to blocks; `edit_message_text` accepts `rich_message` |
| Media            | `send_photo/document/video/audio/voice/animation/sticker/dice/location/contact`; uploaded `file_content` round-trips through `get_file` / `client.getFile`   |
| Chat-level       | `send_chat_action`, `set_message_reaction`, `answer_callback_query`, `get_me`, `get_chat`                                                                    |

Text with `parse_mode: "HTML"` is parsed the way the real API does it: tags
are stripped and become `entities` on the returned `Message`.

Any other method returns a regular `NotOkResponse` client error — the same
shape a real API failure produces — so your error handling is exercised too.

## Drafts, Actions, and Reactions

Streaming bots (`send_message_draft`) and reactions are first-class:

```typescript
emulator.draft // the streamed draft, or null
emulator.reactions // { [message_id]: ["👍"] }

await emulator.nextEvent((e) => e.type === "draft_cleared")
emulator.subscribe((event) => {
  // + "draft" | "draft_cleared" | "chat_action" | "reactions"
})
```

Chat and participant identities are configurable:

```typescript
const emulator = makeTgBotEmulator({
  chat_id: 42,
  user: { id: 7, first_name: "Alice", username: "alice" },
  bot: { id: 1000, first_name: "My Bot", username: "my_test_bot" }
})
```
