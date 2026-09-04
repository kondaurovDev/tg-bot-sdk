# @effect-ak/tg-bot-api

## 1.12.0

## 1.11.0

### Minor Changes

- bf7a7f8: Regenerate types for Telegram Bot API 10.3 (Mini Apps 10.1).

  - Rich messages: `RichMessageButton`, `RichTextButton`, `RichBlockButtons` / `InputRichBlockButtons`, `RichBlockExpandableBlockQuotation` / `InputRichBlockExpandableBlockQuotation`, `RichBlockDocument` / `InputRichBlockDocument`, `is_compact` on `RichBlockTable` / `InputRichBlockTable`.
  - Ephemeral messages: new `EphemeralMessageParameters` class replaces the `receiver_user_id` and `callback_query_id` parameters across the `send*` methods with a single `ephemeral_message_parameters`.
  - Reply markup: `DisabledButton`, `disabled` on `InlineKeyboardButton`, `force_reply` on `InlineKeyboardMarkup` and `ReplyKeyboardMarkup`.
  - General: `MessageGenerationStopped` with `Update.stopped_message_generation`, `CommunityChatJoined` with `Message.community_chat_joined`, `can_send_welcome_messages` on admin rights and `promoteChatMember`, `can_stop` / `keep_on_stop` on the draft methods, `text` / `entities` / `is_private` on `UniqueGiftInfo`.

  The scraper no longer fails when Telegram publishes a type without any prose description (as it did for `EphemeralMessageParameters`); it emits a `no-description` warning and generates the type from its field table.

## 1.10.0

## 1.9.0

### Minor Changes

- 77ec5a6: Update generated types to Telegram Bot API 10.2

  - Rich messages: explicit media via `InputRichMessageMedia` and the `media` field on `InputRichMessage`, new `InputMediaVoiceNote`, block-level content classes (`InputRichBlockParagraph`, `InputRichBlockSectionHeading`, `InputRichBlockList`, `InputRichBlockTable`, `InputRichBlockMathematicalExpression`, and more)
  - Ephemeral messages: `edit_ephemeral_message_text`, `edit_ephemeral_message_media`, `edit_ephemeral_message_caption`, `edit_ephemeral_message_reply_markup`, `delete_ephemeral_message`, `is_ephemeral` on `BotCommand`, ephemeral-related fields on `Message`
  - Communities: new `Community` class and related message fields (`CommunityChatAdded`)

## 1.8.0

## 1.7.0

### Minor Changes

- 6c7ba8a: Update generated Telegram Bot API metadata to Bot API 10.1.

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
