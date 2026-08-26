# @effect-ak/tg-bot-api

[![NPM Version](https://img.shields.io/npm/v/%40effect-ak%2Ftg-bot-api)](https://www.npmjs.com/package/@effect-ak/tg-bot-api)
![Telegram Bot API](https://img.shields.io/badge/BotApi-10.3-blue)
![Telegram WebApp](https://img.shields.io/badge/Telegram.WebApp-10.1-orange)

Complete TypeScript types for Telegram Bot API and Mini Apps, auto-generated from official documentation.

## Installation

```bash
npm install @effect-ak/tg-bot-api
```

## Features

- **Always Up-to-Date** — generated from [official Telegram docs](https://core.telegram.org/bots/api) via code generator
- **WebApp Types** — types for `Telegram.WebApp` included
- **Smart Type Mapping** — `Integer` → `number`, `True` → `boolean`, enums → union literals, etc.

## What's Exported

```typescript
import type {
  Api,
  Update,
  Message,
  CallbackQuery,
  InlineKeyboardMarkup,
  SendMessageInput,
  WebApp
} from "@effect-ak/tg-bot-api"

// Api — one method per Bot API method, snake_case, typed input → typed result
interface Api {
  send_message(_: SendMessageInput): Message
  answer_callback_query(_: AnswerCallbackQueryInput): boolean
  // … every Bot API method
}
// Every Bot API type as an interface (Update, Message, Chat, User, …)
// <Method>Input — parameter object of each method (SendMessageInput, EditMessageTextInput, …)
// WebApp, WebAppInitData, ThemeParams, … — Telegram.WebApp (Mini Apps) surface
// verifyLoginData(...) — validate Telegram Login Widget / Mini App init data hash
```

Field names, optionality and descriptions are taken verbatim from the official docs, so anything you read at https://core.telegram.org/bots/api applies as is. `InputFile` parameters additionally accept `{ file_content: Uint8Array, file_name: string }` (used by the client for uploads).

Machine-readable versions of the same spec are published with the docs: [bot-api.json](https://tg-bot-sdk.website/bot-api.json), [mini-app.json](https://tg-bot-sdk.website/mini-app.json).

## Documentation

- Bot API types: **[tg-bot-sdk.website/api-types/bot-api](https://tg-bot-sdk.website/api-types/bot-api/)**, Mini Apps: [/api-types/webapp](https://tg-bot-sdk.website/api-types/webapp/)
- Reference, one page per method/type: https://tg-bot-sdk.website/api/
- How the generator works: [/api-types/how-it-works](https://tg-bot-sdk.website/api-types/how-it-works/)
- For LLMs / coding agents: https://tg-bot-sdk.website/llms.txt

## Updating Telegram Bot API Types

Use this checklist when a new Telegram Bot API version is released.

### Project context

- Monorepo with pnpm workspaces.
- `packages/api/` contains auto-generated TypeScript types from official Telegram Bot API HTML docs.
- Codegen scrapes https://core.telegram.org/bots/api and https://core.telegram.org/bots/webapps.
- Downloaded HTML is cached in `packages/api/input/api.html` and `packages/api/input/webapp.html`.
- Version files are `packages/api/bot-api-version.json` and `packages/api/mini-app-version.json`.
- Stats are stored in `docs/src/data/bot-api-stats.json`.
- Badges are updated in `readme.md` and `packages/api/readme.md`.

### 1. Delete cached HTML

Remove both cached files so codegen downloads fresh docs:

```bash
rm -f packages/api/input/api.html packages/api/input/webapp.html
```

### 2. Run codegen

```bash
cd packages/api && pnpm run gen
```

This will:

- Download fresh HTML from Telegram.
- Parse and generate TypeScript types into `src/specification/`.
- Update version files and stats automatically.

### 3. Check what changed

```bash
git diff --stat
```

Look at:

- `packages/api/bot-api-version.json` - did the version number change?
- `packages/api/src/specification/types.ts` - new or changed interfaces.
- `packages/api/src/specification/api.ts` - new or changed methods.
- `docs/src/data/bot-api-stats.json` - updated type and method counts.

### 4. Analyze the changelog

Read `packages/api/input/api.html` and search for the changelog section near the top. Look for the latest version entry and summarize:

- New types added.
- New methods added.
- New or changed fields on existing types.
- Any breaking changes, such as removed or renamed fields.

### 5. Verify everything works

Run in sequence:

```bash
pnpm build
pnpm typecheck
pnpm test
```

All commands must pass with zero errors.

### 6. Report

Output a summary with:

- Previous version -> new version.
- Number of new types and methods.
- Key changes, including new types, methods, and fields.
- Build, typecheck, and test status.
- Reminder to create a changeset. A minor changeset on `@effect-ak/tg-bot-api` is enough because `fixed` versioning in `.changeset/config.json` will bump all three packages together.

## License

MIT
