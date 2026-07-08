---
title: Quick Start
description: Install and get up and running with Telegram Bot SDK
---

## HTTP Client

<div class="not-content" style="display:flex;gap:8px;margin-bottom:12px">
  <a href="https://www.npmjs.com/package/@effect-ak/tg-bot-client"><img alt="npm version" src="https://img.shields.io/npm/v/@effect-ak/tg-bot-client?color=f38020&label=npm"></a>
  <a href="https://www.npmjs.com/package/@effect-ak/tg-bot-client"><img alt="npm downloads" src="https://img.shields.io/npm/dw/@effect-ak/tg-bot-client?color=4c1&label=downloads/week"></a>
</div>

```bash
npm install @effect-ak/tg-bot-client
```

```typescript
import { makeTgBotClient } from "@effect-ak/tg-bot-client"

const client = makeTgBotClient({
  bot_token: "YOUR_BOT_TOKEN"
})

// throws TgBotClientError on failure
const message = await client.execute("send_message", {
  chat_id: "123456789",
  text: "Hello, World!"
})

console.log("Sent:", message.message_id)

// or handle errors as values with the non-throwing variant
const result = await client.executeSafe("get_me", {})

if (result.ok) {
  console.log("Bot:", result.data.first_name)
}
```

## Bot Runner

<div class="not-content" style="display:flex;gap:8px;margin-bottom:12px">
  <a href="https://www.npmjs.com/package/@effect-ak/tg-bot"><img alt="npm version" src="https://img.shields.io/npm/v/@effect-ak/tg-bot?color=f38020&label=npm"></a>
  <a href="https://www.npmjs.com/package/@effect-ak/tg-bot"><img alt="npm downloads" src="https://img.shields.io/npm/dw/@effect-ak/tg-bot?color=4c1&label=downloads/week"></a>
</div>

```bash
npm install @effect-ak/tg-bot
```

```typescript
import { createBot } from "@effect-ak/tg-bot"

createBot()
  .onMessage(({ command, text }) => [
    command("/start", ({ ctx }) => ctx.reply("Welcome!")),
    text(({ update, ctx }) => ctx.reply(`You said: ${update.text}`))
  ])
  .run({
    bot_token: "YOUR_BOT_TOKEN"
  })
```

:::tip[Try it live]
Don't want to install anything? [Open the Playground](/playground/) and run a bot right in your browser.
:::

## API Types only

<div class="not-content" style="display:flex;gap:8px;margin-bottom:12px">
  <a href="https://www.npmjs.com/package/@effect-ak/tg-bot-api"><img alt="npm version" src="https://img.shields.io/npm/v/@effect-ak/tg-bot-api?color=f38020&label=npm"></a>
  <a href="https://www.npmjs.com/package/@effect-ak/tg-bot-api"><img alt="npm downloads" src="https://img.shields.io/npm/dw/@effect-ak/tg-bot-api?color=4c1&label=downloads/week"></a>
</div>

If you only need TypeScript type definitions:

```bash
npm install @effect-ak/tg-bot-api
```
