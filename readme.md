# Telegram Bot TypeScript SDK

[![Docs](https://img.shields.io/badge/Docs-tg--bot--sdk.website-blue)](https://tg-bot-sdk.website)
![Telegram Bot API](https://img.shields.io/badge/BotApi-9.6-blue)
![Telegram WebApp](https://img.shields.io/badge/Telegram.WebApp-9.5-orange)

Type-safe TypeScript SDK for building Telegram bots, automatically generated from official Telegram Bot API documentation.

## 📦 Packages

This monorepo contains three packages:

### [@effect-ak/tg-bot-api](./packages/api)

TypeScript types for Telegram Bot API and Mini Apps, auto-generated from official documentation.

### [@effect-ak/tg-bot-client](./packages/client)

Lightweight HTTP client for Telegram Bot API with full type safety.

### [@effect-ak/tg-bot](./packages/bot)

Bot framework with fluent builder API, long polling, webhooks, and hot reload.

## 🚀 Quick Start

### Bot Framework

```bash
npm install @effect-ak/tg-bot
```

```typescript
import { createBot } from "@effect-ak/tg-bot"

await createBot()
  .onMessage(({ command, text }) => [
    command("/start", ({ ctx }) => ctx.reply("Welcome!")),
    text(({ update, ctx }) => ctx.reply(`You said: ${update.text}`))
  ])
  .run({ bot_token: "YOUR_BOT_TOKEN" })
```

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

## 🎯 Key Features

- **Always Up-to-Date**: Types generated from official Telegram API documentation
- **Fully Type-Safe**: Complete TypeScript support for all API methods and types
- **Zero Config**: Works out of the box with sensible defaults
- **No Webhooks Required**: Uses long polling - run anywhere without public URLs

## 📚 Documentation

Full documentation and API reference: **[tg-bot-sdk.website](https://tg-bot-sdk.website)**

- [Introduction](https://tg-bot-sdk.website/getting-started/introduction/)
- [Quick Start](https://tg-bot-sdk.website/getting-started/quick-start/)
- [API Reference](https://tg-bot-sdk.website/api/)

## 🎮 Playground

Try it in your browser: **[Telegram Bot Playground](https://tg-bot-sdk.website/playground/)**

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
