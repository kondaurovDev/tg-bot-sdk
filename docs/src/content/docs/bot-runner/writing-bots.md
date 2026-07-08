---
title: Writing Bots
description: How to write a Telegram bot — match incoming updates and respond with the right action
---

A Telegram bot is simple: Telegram sends your bot **updates** (messages, commands, button clicks, etc.), and you decide what to do with each one. That's it.

You write a list of rules — **handlers** — each with a condition and an action. The bot checks them top to bottom and runs the first match. Think of it as a `switch/case` for incoming updates.

:::tip[Try it live]
All examples work in the browser — [open the Playground](/playground/) to experiment without any setup.
:::

## How It Works

```typescript
import { createBot } from "@effect-ak/tg-bot"

const bot = createBot().onMessage(({ command, text, fallback }) => [
  // Rule 1: user sent /start → greet them
  command("/start", ({ ctx }) => ctx.reply("Welcome!")),
  // Rule 2: user sent any text → echo it back
  text(({ update, ctx }) => ctx.reply(`You said: ${update.text}`)),
  // Rule 3: catch-all fallback
  fallback(({ ctx }) => ctx.ignore)
])

bot.run({
  bot_token: "YOUR_BOT_TOKEN"
})
```

Each handler has two parts:

- **`match`** — a condition: should this handler run? Built-in helpers like `command()`, `text()`, `photo()` handle common cases. If omitted (like `fallback`), the handler always runs.
- **`handle`** — the action: what to do when the condition is met.

Handlers are checked in order, top to bottom. The first match wins — the rest are skipped.

## Handler Helpers

The `onMessage` callback provides helper functions for common patterns:

| Helper                  | Matches                           |
| ----------------------- | --------------------------------- |
| `command(cmd, handler)` | Specific command (e.g., `/start`) |
| `text(handler)`         | Any text message                  |
| `photo(handler)`        | Photo message                     |
| `document(handler)`     | Document message                  |
| `sticker(handler)`      | Sticker message                   |
| `fallback(handler)`     | Always matches (catch-all)        |

You can also mix helpers with raw handler objects for custom match logic:

```typescript
createBot().onMessage(({ command, text }) => [
  command("/start", ({ ctx }) => ctx.reply("Hi!")),
  // Custom match — raw handler object
  {
    match: ({ update }) => !!update.text?.includes("+"),
    handle: ({ update, ctx }) => ctx.reply(`Got: ${update.text}`)
  },
  text(({ ctx }) => ctx.reply("Send me something with +"))
])
```

## Context Helpers

Every handler receives a `ctx` object with useful methods:

- `ctx.reply(text, options?)` — Send a text message
- `ctx.replyWithDocument(document, options?)` — Send a document
- `ctx.replyWithPhoto(photo, options?)` — Send a photo
- `ctx.command` — Parsed command (e.g., `"/start"`, `"/help"`)
- `ctx.ignore` — Skip the update without responding

## Sending Responses

Handlers return a `BotResponse` object. You can use `ctx` helpers (shown above) or build responses directly:

```typescript
import { BotResponse } from "@effect-ak/tg-bot"

// Send a message
BotResponse.make({ type: "message", text: "Hello!" })

// Send a photo
BotResponse.make({
  type: "photo",
  photo: { file_content: photoBuffer, file_name: "image.jpg" },
  caption: "Check this out!"
})

// Ignore update
BotResponse.ignore
```

All Telegram `send_*` methods are supported: `message`, `photo`, `document`, `video`, `audio`, `voice`, `sticker`, `dice`, etc.

## Update Types

You can handle different types of Telegram updates using fluent methods:

| Method                   | Trigger                             |
| ------------------------ | ----------------------------------- |
| `.onMessage()`           | New incoming message                |
| `.onEditedMessage()`     | Message was edited                  |
| `.onChannelPost()`       | New channel post                    |
| `.onEditedChannelPost()` | Channel post was edited             |
| `.onCallbackQuery()`     | Callback query from inline keyboard |
| `.onInlineQuery()`       | Inline query                        |
| `.on(type)`              | Any other update type               |

```typescript
createBot()
  .onMessage(({ command }) => [command("/start", ({ ctx }) => ctx.reply("Welcome!"))])
  .onCallbackQuery(({ data }) => [data("confirm", ({ ctx }) => ctx.reply("Confirmed!"))])
```

## Error Handling

If a handler throws an error, the bot:

1. Logs the error with update details
2. Sends an error message to the user
3. Continues processing other updates (if `on_error: "continue"`)

Up to 10 updates are processed concurrently. If some handlers fail, others continue.
