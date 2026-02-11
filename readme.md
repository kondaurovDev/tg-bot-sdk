# Telegram Bot TypeScript SDK

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Type-safe TypeScript SDK for building Telegram bots, automatically generated from official Telegram Bot API documentation.

## 📦 Packages

This monorepo contains three packages:

### [@effect-ak/tg-bot-api](./packages/api)

[![NPM Version](https://img.shields.io/npm/v/%40effect-ak%2Ftg-bot-api)](https://www.npmjs.com/package/@effect-ak/tg-bot-api)
![Telegram Bot API](https://img.shields.io/badge/BotApi-9.3-blue)
![Telegram WebApp](https://img.shields.io/badge/Telegram.WebApp-9.1-blue)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-blue.svg)](https://effect-ak.github.io/telegram-bot-api/)
![NPM Downloads](https://img.shields.io/npm/dw/%40effect-ak%2Ftg-bot-api)

TypeScript types for Telegram Bot API and Mini Apps, auto-generated from official documentation.

### [@effect-ak/tg-bot-client](./packages/client)

[![NPM Version](https://img.shields.io/npm/v/%40effect-ak%2Ftg-bot-client)](https://www.npmjs.com/package/@effect-ak/tg-bot-client)
![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/%40effect-ak%2Ftg-bot-client)
![NPM Downloads](https://img.shields.io/npm/dw/%40effect-ak%2Ftg-bot-client)

Lightweight HTTP client for Telegram Bot API with full type safety.

### [@effect-ak/tg-bot](./packages/bot)

[![NPM Version](https://img.shields.io/npm/v/%40effect-ak%2Ftg-bot)](https://www.npmjs.com/package/@effect-ak/tg-bot)
![NPM Downloads](https://img.shields.io/npm/dw/%40effect-ak%2Ftg-bot)

Effect-based bot runner with automatic long polling and error handling.

## 🚀 Quick Start

### HTTP Client

```bash
npm install @effect-ak/tg-bot-client
```

```typescript
import { makeTgBotClient } from "@effect-ak/tg-bot-client"

const client = makeTgBotClient({
  bot_token: "YOUR_BOT_TOKEN"
})

await client.execute("sendMessage", {
  chat_id: "123456789",
  text: "Hello, World!"
})
```

### Bot Runner

```bash
npm install @effect-ak/tg-bot effect
```

```typescript
import { runTgChatBot } from "@effect-ak/tg-bot"

runTgChatBot({
  bot_token: "YOUR_BOT_TOKEN",
  mode: "single",
  on_message: [
    {
      match: ({ ctx }) => ctx.command === "/start",
      handle: ({ ctx }) => ctx.reply("Welcome!")
    },
    {
      match: ({ update }) => !!update.text,
      handle: ({ update, ctx }) => ctx.reply(`You said: ${update.text}`)
    }
  ]
})
```

## 🎯 Key Features

- **Always Up-to-Date**: Types generated from official Telegram API documentation
- **Fully Type-Safe**: Complete TypeScript support for all API methods and types
- **Zero Config**: Works out of the box with sensible defaults
- **No Webhooks Required**: Uses long polling - run anywhere without public URLs

## 📚 Documentation

Each package has its own detailed documentation:

- [API Types Documentation](./packages/api) - TypeScript types for Bot API and Mini Apps
- [Client Documentation](./packages/client) - HTTP client usage and examples
- [Bot Runner Documentation](./packages/bot) - Building bots with handlers and polling

## 🎮 Playground

Try it in your browser: **[Telegram Bot Playground](https://effect-ak.github.io/tg-bot-playground/)**

## 🛠️ Development

### Setup

```bash
pnpm install
pnpm build
```

### CI/CD

Push to `main` triggers two GitHub Actions workflows:

1. **Build** — runs `pnpm build`, `pnpm typecheck`, and `pnpm test`
2. **Release** — runs after a successful Build, uses [changesets](https://github.com/changesets/changesets) to version and publish packages to npm

To release a new version:

1. Create a changeset: `pnpm changeset`
2. Commit the generated changeset file and merge to `main`
3. The Release workflow will open a "Release" PR that bumps versions
4. Merge the PR — packages are automatically published to npm

Packages are published with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) via OIDC between GitHub Actions and npm, so every published version is cryptographically signed and linked back to its source commit and workflow run.
