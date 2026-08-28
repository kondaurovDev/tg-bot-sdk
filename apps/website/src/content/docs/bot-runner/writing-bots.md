---
title: Writing Bots
description: How to write a Telegram bot — match incoming updates and respond with the right action
---

A Telegram bot is simple: Telegram sends your bot **updates** (messages, commands, button clicks, etc.), and you decide what to do with each one. That's it — no middleware chains, no plugins, no framework ceremony.

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
  text(({ payload, ctx }) => ctx.reply(`You said: ${payload.text}`)),
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

Every handler receives `{ payload, ctx }`:

- **`payload`** — the typed content of the update: a `Message` for `onMessage`, a `CallbackQuery` for `onCallbackQuery`, and so on. It is _not_ the `Update` envelope, so `payload.text`, `payload.chat.id`, `payload.data` are right there.
- **`ctx`** — helpers that build the response (`ctx.reply`, `ctx.editMessageText`, …) plus `ctx.command`.

### Shortcuts

For a bot with a couple of commands the callback-with-helpers form is more than you need. `command`, `onText` and `onCallback` register a single handler directly:

```typescript
createBot()
  .command("/start", ({ ctx }) => ctx.reply("Welcome!"))
  .command("/help", ({ ctx }) => ctx.reply("Send me any text"))
  .onText(({ payload, ctx }) => ctx.reply(`You said: ${payload.text}`))
  .onCallback("confirm", ({ ctx }) => ctx.editMessageText("Confirmed!"))
  .run({ bot_token: "YOUR_BOT_TOKEN" })
```

They are exactly `onMessage(({ command }) => [command(...)])` and friends underneath, so both styles mix freely and are matched in registration order.

Commands match regardless of case and of the `@bot_name` suffix Telegram adds in groups: `command("/start")` (or `command("start")`) handles `/start`, `/START` and `/start@my_bot`.

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
    match: ({ payload }) => !!payload.text?.includes("+"),
    handle: ({ payload, ctx }) => ctx.reply(`Got: ${payload.text}`)
  },
  text(({ ctx }) => ctx.reply("Send me something with +"))
])
```

## Context Helpers

Every handler receives a `ctx` object with useful methods:

- `ctx.reply(text, options?)` — Send a text message
- `ctx.replyWithDocument(document, options?)` — Send a document
- `ctx.replyWithPhoto(photo, options?)` — Send a photo
- `ctx.answerCallbackQuery(options?)` — Answer the callback query (stop the button spinner, show a toast or alert)
- `ctx.editMessageText(text, options?)` — Edit the message this update refers to (e.g. the one with the tapped keyboard)
- `ctx.editMessageReplyMarkup(options?)` — Replace that message's inline keyboard
- `ctx.deleteMessage()` — Delete that message
- `ctx.call(method, params)` — Any other Bot API method
- `ctx.command` — Parsed command (e.g., `"/start"`, `"/help"`)
- `ctx.ignore` — Skip the update without responding

`ctx.reply*` send to the chat the update came from — for a `callback_query` that is the chat of the message with the tapped button. `editMessageText`, `editMessageReplyMarkup` and `deleteMessage` target the message the update refers to; `answerCallbackQuery` targets the current callback query. All of them throw a descriptive error if the update has no such target.

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

// Any Bot API method with full parameters
BotResponse.call("send_chat_action", { chat_id, action: "typing" })

// Ignore update
BotResponse.ignore
```

All Telegram `send_*` methods are supported via `BotResponse.make`: `message`, `photo`, `document`, `video`, `audio`, `voice`, `sticker`, `dice`, etc. `chat_id` is filled in from the update.

### Several Actions per Update

A handler may return an **array** of responses; the calls run sequentially in the given order. `.and()` and `BotResponse.all()` do the same when you compose responses elsewhere:

```typescript
data("save", ({ ctx }) => [
  ctx.answerCallbackQuery({ text: "Done" }),
  ctx.editMessageText("Saved ✅")
])

command("/two", ({ ctx }) => ctx.reply("one").and(ctx.reply("two")))
```

## Inline Keyboards and Callback Queries

An inline-keyboard bot keeps its UI in a single message and rewrites it in place as the user taps buttons. Two calls make that work: `answer_callback_query` stops the loading spinner on the tapped button (Telegram only accepts it for a few seconds), and `edit_message_text` redraws the screen.

```typescript
const menu = {
  inline_keyboard: [
    [{ text: "📋 Services", callback_data: "screen:services" }],
    [{ text: "☎️ Contacts", callback_data: "screen:contacts" }]
  ]
}

createBot()
  .onMessage(({ command }) => [
    command("/start", ({ ctx }) => ctx.reply("Main menu", { reply_markup: menu }))
  ])
  .onCallbackQuery(({ data, fallback }) => [
    // Redraw the same message with the next screen
    data(/^screen:/, ({ payload, ctx }) =>
      ctx.editMessageText(`Screen: ${payload.data!.slice(7)}`, {
        reply_markup: { inline_keyboard: [[{ text: "⬅️ Back", callback_data: "screen:root" }]] }
      })
    ),
    // Show a popup without changing the screen
    data("info", ({ ctx }) =>
      ctx.answerCallbackQuery({ text: "Nothing here yet", show_alert: true })
    ),
    // Stale button from an old message: just stop the spinner
    fallback(({ ctx }) => ctx.answerCallbackQuery())
  ])
```

:::tip[Prefer screens for menus]
For a menu-style bot you usually don't need to write callback handlers at all — describe the screens as data with [`defineScreens`](/bot-runner/screens/) and let the SDK render, edit in place and handle Back.
:::

:::tip[Callback queries are answered for you]
When a `callback_query` handler returns any non-empty response that does not already contain `answer_callback_query`, the runner sends an empty `answer_callback_query` first, so the button never hangs. Call `ctx.answerCallbackQuery({ text, show_alert })` yourself when you want a toast or an alert. `ctx.ignore` sends nothing at all.
:::

## Update Types

You can handle different types of Telegram updates using fluent methods:

| Method                   | Trigger                             |
| ------------------------ | ----------------------------------- |
| `.command(cmd, h)`       | One bot command (shortcut)          |
| `.onText(h)`             | Any text message (shortcut)         |
| `.onCallback(data, h)`   | One callback `data` (shortcut)      |
| `.onMessage()`           | New incoming message                |
| `.onEditedMessage()`     | Message was edited                  |
| `.onChannelPost()`       | New channel post                    |
| `.onEditedChannelPost()` | Channel post was edited             |
| `.onCallbackQuery()`     | Callback query from inline keyboard |
| `.onInlineQuery()`       | Inline query                        |
| `.on(type)`              | Any other update type               |

Each `.onXxx()` accepts a callback with helpers (shown above), a single `{ match?, handle }` object, or an array of them.

```typescript
createBot()
  .onMessage(({ command }) => [command("/start", ({ ctx }) => ctx.reply("Welcome!"))])
  .onCallbackQuery(({ data }) => [data("confirm", ({ ctx }) => ctx.editMessageText("Confirmed!"))])
```

## Streaming Replies

`ctx.stream` sends the reply the way AI bots do (Bot API 9.3+): a "Thinking…"
placeholder, then a live draft that grows with every chunk
(`send_message_draft`, animated in place), then a final `send_message` with
the full text.

```typescript
createBot()
  // a string is split into words — handy for demos
  .command("/story", ({ ctx }) => ctx.stream("Once upon a time…", { interval_ms: 120 }))
  // any AsyncIterable<string> works — e.g. an LLM token stream
  .onText(({ payload, ctx }) => ctx.stream(askLlm(payload.text!)))
```

Options: `interval_ms` paces the draft updates (default `200`, `0` disables
pacing), `parse_mode` and `reply_markup` apply to the final message. If the
source throws mid-stream, whatever was buffered is still finalized. Try it
live in the [playground](/playground/) — the "Streaming" example.

## Error Handling

If a handler throws an error, the bot:

1. Logs the error with update details
2. Sends an error message to the user
3. Continues processing other updates (if `on_error: "continue"`)

Up to 10 updates are processed concurrently. If some handlers fail, others continue.

## Next steps

- [Running Bots](/bot-runner/running-bots/) — start your bot with long polling or deploy it with webhooks
- [Examples](/bot-runner/examples/) — ready-to-run bots you can copy or open in the Playground
