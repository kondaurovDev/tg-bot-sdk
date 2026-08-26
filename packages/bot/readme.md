# @effect-ak/tg-bot

[![NPM Version](https://img.shields.io/npm/v/%40effect-ak%2Ftg-bot)](https://www.npmjs.com/package/@effect-ak/tg-bot)
![NPM Downloads](https://img.shields.io/npm/dw/%40effect-ak%2Ftg-bot)

Telegram bot framework for TypeScript: fluent builder, typed handlers for every update type, long polling **or** webhooks (Cloudflare Workers, Bun, Deno, Node), inline-keyboard screens declared as data. Built on [`@effect-ak/tg-bot-client`](https://www.npmjs.com/package/@effect-ak/tg-bot-client) — native `fetch`, zero runtime dependencies.

## Installation

```bash
npm install @effect-ak/tg-bot
```

That's the only package you need. The client and the Bot API types are re-exported under subpaths:

```typescript
import { createBot } from "@effect-ak/tg-bot"
import type { Message, Update } from "@effect-ak/tg-bot/api"
import { makeTgBotClient } from "@effect-ak/tg-bot/client"
```

Installing [`@effect-ak/tg-bot-api`](https://www.npmjs.com/package/@effect-ak/tg-bot-api) or [`@effect-ak/tg-bot-client`](https://www.npmjs.com/package/@effect-ak/tg-bot-client) directly still works and resolves to the same declarations — the subpaths are re-exports, not copies.

## Quick Start

```typescript
import { createBot } from "@effect-ak/tg-bot"

const bot = createBot()
  .command("/start", ({ ctx }) => ctx.reply("Welcome!"))
  .onText(({ payload, ctx }) => ctx.reply(`You said: ${payload.text}`))
  .onCallback("confirm", ({ ctx }) => ctx.editMessageText("Confirmed ✅"))

await bot.run({ bot_token: "YOUR_BOT_TOKEN" }) // long polling
```

## How It Works

1. `createBot()` returns a builder. `.command`, `.onText`, `.onCallback` register one handler each; `.onMessage`, `.onCallbackQuery`, `.onInlineQuery`, `.on(type)` register a **list of guarded handlers** for one update type. Handlers are tried in registration order; the first whose `match` passes runs.
2. Each handler receives `{ payload, ctx }` — `payload` is the typed `Message` / `CallbackQuery` / … (not the `Update` envelope) — and **returns a `BotResponse`** (or an array of them). It never calls the API itself: the runner executes the response (`send_*`, `edit_message_text`, `answer_callback_query`, any method) and reports the outcome to `onHandleResult`.
3. `.run({ bot_token })` starts long polling; `.webhook({ bot_token, secret_token })` returns a `(Request) => Promise<Response>` handler for serverless.

## API Surface

```typescript
createBot()
  .command("/start", handler)                              // shortcuts: one handler each
  .onText(handler)
  .onCallback("data" | /regex/, handler)
  .onMessage(({ command, text, photo, document, sticker, fallback }) => [...])
  .onCallbackQuery(({ data, fallback }) => [...])         // data(string | RegExp, handler)
  .onInlineQuery(({ query, fallback }) => [...])
  .on("my_chat_member", { match?, handle })                // any other update type
  .use(plugin)                                             // e.g. defineScreens(...)
  .run({ bot_token, poll?, logger?, onHandleResult? })     // → BotInstance { stop(), reload() }
  .webhook({ bot_token, secret_token, logger?, onHandleResult? })
  // → handler(request), handler.handleUpdate(update), handler.setWebhook({ url, ... })

// handler = ({ payload, ctx }) => BotResponse | BotResponse[]   (sync or async)
// payload: Message | CallbackQuery | InlineQuery | ... — typed per update type

// ctx — available in every handler
ctx.reply(text, options?)                 // send_message to the update's chat
ctx.replyWithPhoto(photo, options?)       // send_photo
ctx.replyWithDocument(document, options?) // send_document
ctx.editMessageText(text, options?)       // edit the message this update refers to
ctx.editMessageReplyMarkup(options?)
ctx.deleteMessage()
ctx.answerCallbackQuery({ text?, show_alert? }?)
ctx.call(method, params)                  // any Bot API method
ctx.command                               // "/start" | undefined
ctx.ignore                                // do nothing

// Several calls in one handler: return an array (executed in order)
onCallback("save", ({ ctx }) => [ctx.answerCallbackQuery({ text: "Saved" }), ctx.editMessageText("✅")])

// BotResponse — build responses without ctx (rarely needed)
BotResponse.call("send_chat_action", params)    // any method with full params
BotResponse.make({ type: "message", text })     // any send_* method, chat_id filled in
BotResponse.all(a, b) / a.and(b)                // same as returning an array
BotResponse.ignore
```

Rules the runner applies for you:

- A `callback_query` handler that responds without `answer_callback_query` gets one sent automatically — buttons never hang.
- `command("/start")` also matches `/START` and `/start@your_bot` (groups).
- `ctx.reply*` from a callback query goes to the chat of the tapped message.
- If a handler throws, the error is logged, an apology is sent, and other updates keep flowing (`poll.on_error: "continue"` by default).

## Inline Keyboards as Data

Describe screens once; the SDK renders them, edits the message in place, adds Back buttons and answers callback queries:

```typescript
import { createBot, defineScreens } from "@effect-ak/tg-bot"

const screens = defineScreens(
  {
    root: {
      text: "🏠 Main menu",
      buttons: [
        [
          { label: "Hours", next: "hours" },
          { label: "Site", url: "https://example.com" }
        ]
      ]
    },
    hours: {
      text: "Mon–Fri 9–18",
      parent: "root",
      buttons: [{ label: "Book", action: ({ ctx }) => ctx.answerCallbackQuery({ text: "Soon!" }) }]
    }
  },
  { back: "‹ Back", footer: [{ label: "Talk to a human", url: WHATSAPP_URL }] }
)

createBot().use(screens).webhook({ bot_token, secret_token })
```

`next` is checked against the screen ids at compile time. `text`/`buttons` may be functions of the update; pass a `store` (`get/set` per chat) to make Back an undo of the last step instead of the static `parent`. Custom entry points: `command("/menu", screens.open("root"))`.

## Webhook

```typescript
const handler = createBot()
  .onMessage(({ command }) => [command("/start", ({ ctx }) => ctx.reply("Hello!"))])
  .webhook({
    bot_token: "YOUR_BOT_TOKEN",
    // Telegram echoes this back in X-Telegram-Bot-Api-Secret-Token;
    // requests without it are rejected with 403. Always set it.
    secret_token: "YOUR_WEBHOOK_SECRET"
  })

// Cloudflare Workers / Bun / Deno: a plain Request → Response function
export default { fetch: handler }

// Register the webhook once — the same secret_token is passed to set_webhook
await handler.setWebhook({ url: "https://your-app.example.com/webhook" })
```

Platforms that give you a parsed body instead of a `Request` (Express, Lambda): check the header yourself and call `handler.handleUpdate(update)`.

## Advanced: Low-Level API

Without the builder, use `runBot` / `createWebhook` directly with `on_<update_type>` handlers:

```typescript
import { runBot } from "@effect-ak/tg-bot"

runBot({
  bot_token: "YOUR_BOT_TOKEN",
  mode: "single", // or "batch" with on_batch(updates)
  on_message: [
    {
      match: ({ payload }) => !!payload.text,
      handle: ({ payload, ctx }) => ctx.reply(payload.text!)
    }
  ]
})
```

## Documentation

- Writing bots: **[tg-bot-sdk.website/bot-runner/writing-bots](https://tg-bot-sdk.website/bot-runner/writing-bots/)**
- Running bots (polling, webhooks, Cloudflare Workers): **[/bot-runner/running-bots](https://tg-bot-sdk.website/bot-runner/running-bots/)**
- Screens: **[/bot-runner/screens](https://tg-bot-sdk.website/bot-runner/screens/)**
- Runnable demo (Cloudflare Worker + GitHub Actions deploy): [`example/`](https://github.com/kondaurovDev/tg-bot-sdk/tree/main/example)
- For LLMs / coding agents: https://tg-bot-sdk.website/llms.txt

## License

MIT
