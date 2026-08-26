# Telegram Bot TypeScript SDK

[![Docs](https://img.shields.io/badge/Docs-tg--bot--sdk.website-blue)](https://tg-bot-sdk.website)
![Telegram Bot API](https://img.shields.io/badge/BotApi-10.3-blue)
![Telegram WebApp](https://img.shields.io/badge/Telegram.WebApp-10.1-orange)

Type-safe TypeScript SDK for building Telegram bots. Types are generated from the official Bot API documentation; everything else is a thin layer over native `fetch` with zero runtime dependencies.

## 📦 Packages

| Package                                         | What it is                                                                                                         | Use it when                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| [`@effect-ak/tg-bot-api`](./packages/api)       | TypeScript types for the whole Bot API + Mini Apps (`Telegram.WebApp`), regenerated from https://core.telegram.org | You only need types (own client, Mini App front-end)                      |
| [`@effect-ak/tg-bot-client`](./packages/client) | HTTP client: `client.execute("send_message", { … })` for every method, typed errors, automatic file uploads        | Sending notifications, managing channels, integrating Telegram in an app  |
| [`@effect-ak/tg-bot`](./packages/bot)           | Bot framework: fluent builder, guarded handlers, long polling **or** webhooks, inline-keyboard screens as data     | Building a bot — locally, on a VPS, or on Cloudflare Workers / Bun / Deno |

Dependency chain: `api` ← `client` ← `bot`. Method names are `snake_case` exactly as in the official docs.

## 🚀 Quick Start

### Bot Framework

```bash
npm install @effect-ak/tg-bot
```

```typescript
import { createBot } from "@effect-ak/tg-bot"

await createBot()
  .command("/start", ({ ctx }) => ctx.reply("Welcome!"))
  .onText(({ payload, ctx }) => ctx.reply(`You said: ${payload.text}`))
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

await client.execute("send_message", {
  chat_id: 123456789,
  text: "Hello, World!"
})
```

### Webhook on Cloudflare Workers, inline-keyboard UI as data

```typescript
import { createBot, defineScreens } from "@effect-ak/tg-bot"

const screens = defineScreens({
  root: { text: "Main menu", buttons: [[{ label: "Hours", next: "hours" }]] },
  hours: { text: "Mon–Fri 9–18", parent: "root" }
})

const bot = createBot().use(screens)

export default {
  fetch: (request: Request, env: Env) =>
    bot.webhook({ bot_token: env.BOT_TOKEN, secret_token: env.WEBHOOK_SECRET })(request)
}
```

A complete, deployable demo (several bots behind one token, KV state, GitHub Actions deploy) lives in [`example/`](./example).

## 🎯 Key Features

- **Always Up-to-Date**: Types generated from official Telegram API documentation
- **Fully Type-Safe**: Complete TypeScript support for all API methods and types; errors are tagged unions
- **Runs Anywhere**: native `fetch`, no dependencies — Node.js 18+, Bun, Deno, Cloudflare Workers, browsers
- **Polling or Webhooks**: long polling needs no public URL; webhooks verify Telegram's secret token out of the box
- **Screens**: inline-keyboard navigation declared as data (`defineScreens`) — Back, actions, edit-in-place handled for you

## 📚 Documentation

Full documentation and API reference: **[tg-bot-sdk.website](https://tg-bot-sdk.website)**

- [Introduction](https://tg-bot-sdk.website/getting-started/introduction/)
- [Quick Start](https://tg-bot-sdk.website/getting-started/quick-start/)
- [API Reference](https://tg-bot-sdk.website/api/)

## 🤖 For LLMs and Coding Agents

- **[tg-bot-sdk.website/llms.txt](https://tg-bot-sdk.website/llms.txt)** — index of the docs with the conventions that matter; **[llms-full.txt](https://tg-bot-sdk.website/llms-full.txt)** — all guides in one file
- **[bot-api.json](https://tg-bot-sdk.website/bot-api.json)** / **[mini-app.json](https://tg-bot-sdk.website/mini-app.json)** — machine-readable Bot API and Mini Apps specs
- Each package README documents its full API surface; repo conventions for agents are in [`.claude/CLAUDE.md`](./.claude/CLAUDE.md)

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
