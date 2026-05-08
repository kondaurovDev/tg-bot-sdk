# @effect-ak/tg-bot-api

## 1.6.0

### Minor Changes

- ac32302: Update generated types to Telegram Bot API 10.0
  - Guest mode: `answerGuestQuery`, `SentGuestMessage`, `guest_message` updates, `supports_guest_queries`
  - Live Photos: `sendLivePhoto`, `LivePhoto`, `InputMediaLivePhoto`, `PaidMediaLivePhoto`, `InputPaidMediaLivePhoto`
  - Polls with media: `media` on `Poll`/`PollOption`/`InputPollOption`, `explanation_media`, `members_only`, `country_codes`
  - Reactions: `deleteMessageReaction`, `deleteAllMessageReactions`, `can_react_to_messages` permission
  - Managed bot access: `getManagedBotAccessSettings`, `setManagedBotAccessSettings`, `BotAccessSettings`
  - Other: `getUserPersonalChatMessages`, `return_bots` on `getChatAdministrators`, empty-text `sendMessageDraft`, business bots without Premium, bot-to-bot messaging via username

## 1.5.1

### Patch Changes

- dae0ed4: - Generated TypeScript types now carry JSDoc comments with field/method descriptions and `@see` links to the documentation site, improving IDE hover tooltips.
  - Publish a language-agnostic JSON spec (`bot-api.json`, `mini-app.json`) at the docs site for third-party codegen, with structured types (`primitive`/`ref`/`array`/`union`/`enum`/`object`) and auto-detected discriminators for tagged unions.
  - Internal codegen refactor: replaced `ts-morph` with a string-based emitter + Prettier; extracted a structured `SpecType` model; cleaned up overrides; various scraper bug fixes.

## 1.5.0

### Minor Changes

- 6edcf09: Update to Telegram Bot API 9.6: managed bots support, enhanced polls with revoting and user-added options

## 1.3.3

### Patch Changes

- e86bf1b: feat(api): update to Telegram Bot API 9.5

## 1.3.2

### Patch Changes

- a0202e0: Add Telegram Login Widget support: `TelegramLoginData` interface, `TelegramLoginService` types for `window.Telegram.Login`, and `verifyLoginData` function using Web Crypto API

## 1.3.1

### Patch Changes

- 8ac8abd: Add homepage, keywords, and update documentation links to tg-bot-sdk.website

## 1.3.0

### Minor Changes

- 94774a9: chore: release packages

## 1.2.0

### Minor Changes

- 3c2bc12: Update to Bot API 9.4, fix version parser, use workspace protocol for internal deps

## 1.1.0

### Minor Changes

- 4c56173: Update Telegram Bot API to version 9.4
