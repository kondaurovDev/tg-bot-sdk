# @effect-ak/tg-bot

[![NPM Version](https://img.shields.io/npm/v/%40effect-ak%2Ftg-bot)](https://www.npmjs.com/package/@effect-ak/tg-bot)
![NPM Downloads](https://img.shields.io/npm/dw/%40effect-ak%2Ftg-bot)

Telegram bot framework with fluent builder API, long polling, webhooks, and hot reload.

## Installation

```bash
npm install @effect-ak/tg-bot
```

## Quick Start

```typescript
import { createBot } from "@effect-ak/tg-bot"

const bot = createBot().onMessage(({ command, text, fallback }) => [
  command("/start", ({ ctx }) => ctx.reply("Welcome!")),
  text(({ update, ctx }) => ctx.reply(`You said: ${update.text}`)),
  fallback(({ ctx }) => ctx.reply("Send me a text message"))
])

await bot.run({ bot_token: "YOUR_BOT_TOKEN" })
```

## Webhook

```typescript
const handler = createBot()
  .onMessage(({ command }) => [command("/start", ({ ctx }) => ctx.reply("Hello!"))])
  .webhook({ bot_token: "YOUR_BOT_TOKEN" })

// Use as a Request -> Response handler
export default handler
```

## Advanced: Low-Level API

For full control without the builder, use `runBot` and `createWebhook` directly:

```typescript
import { runBot } from "@effect-ak/tg-bot"

runBot({
  bot_token: "YOUR_BOT_TOKEN",
  mode: "single",
  on_message: [
    {
      match: ({ update }) => !!update.text,
      handle: ({ update, ctx }) => ctx.reply(`You said: ${update.text}`)
    }
  ]
})
```

## Features

- **Builder API** — fluent `createBot()` with typed helpers (command, text, photo, etc.)
- **Two Modes** — single (one-by-one) and batch processing
- **Polling & Webhooks** — long polling or webhook handler for serverless
- **Type-Safe Handlers** — all Telegram update types supported
- **Hot Reload** — update handlers without restarting
- **Guard Handlers** — match/handle pattern for routing updates

## Documentation

Full documentation, examples, and configuration: **[tg-bot-sdk.website](https://tg-bot-sdk.website)**

## License

MIT
