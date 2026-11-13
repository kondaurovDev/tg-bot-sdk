# @effect-ak/tg-bot-api

## 1.14.0

## 1.13.0

### Minor Changes

- 1fa538c: **`@effect-ak/tg-bot-api`** — `InputFile` accepts a `Blob` or `File` besides `{ file_content, file_name }`. The client always sent them; the type did not allow it.

  **`@effect-ak/tg-bot`** — New `parseWebhookRequest(request, secret_token?)`: verifies the secret token in constant time and reads the `Update`, returning `{ ok: true, update }` or `{ ok: false, status: 400 | 403, reason }`. `createWebhook` uses it; a router that dispatches updates itself (several bots behind one token) should too. A body that is not valid JSON now gets `400` instead of `500`.

  **`@effect-ak/tg-bot-emulator`** — Media sent as a `Blob` or `File` is stored with its bytes (a `File` keeps its name), so `get_file` round-trips it like `file_content` uploads.

- c08995c: Regenerate types for Telegram Bot API 10.4 (Mini Apps unchanged at 10.1).

  - Widgets: `Widget` with `Message.widget` / `ExternalReplyInfo.widget`, `send_widget`, `send_shared_widget`, `answer_widget_query`, `edit_message_widget_data`, `edit_shared_widget_data`, `WidgetQuery` / `SharedWidgetQuery` with `Update.widget_query` / `Update.shared_widget_query`, `WidgetQueryType` (`WidgetQueryTypeData`, `WidgetQueryTypeSignData`, `WidgetQueryTypeSentTransaction`), `WidgetQueryWallet`, `InputWidgetMessageContent`, `InputSharedWidgetMessageContent`.
  - Ephemeral messages: `chat_id` is now optional in `send_message`, `send_rich_message` and the other `send*` methods that take `ephemeral_message_parameters`, and so is `EphemeralMessageParameters.receiver_user_id` — an ephemeral reply to a callback query needs only `callback_query_id`.
  - Quotes from rich messages: `TextQuote.rich_texts`, `ReplyParameters.quote_rich_texts`.
  - TON wallet: `TonWalletCard`, `TonWalletCardSticker`, `TonNft`, `TonNftAttribute`, `ChatFullInfo.ton_wallet_card`, `TonWalletTransfer` with `Message.ton_wallet_transfer`.
  - Chat share themes: `ChatShareTheme`, `ChatShareThemeEmoji`, `ChatShareThemeUniqueGift`, `ChatShareThemeBackdrop`, `ChatShareThemeBackdrops`, `EmojiType` (`EmojiTypeEmoji`, `EmojiTypeCustomEmoji`), `ChatFullInfo.share_theme`, `get_chat_share_theme_backdrops`.
  - Gifts: `get_unique_gift`, `delete_business_account_gift`.
  - General: `RichTextTonAddress`, the `ton_address` and `bank_card_number` types of `MessageEntity`, `custom_description_parse_mode` / `custom_description_entities` on `verify_user` and `verify_chat`, `PaidMessagesWaived` with `Message.paid_messages_waived`.

  Renamed upstream: `StoryAreaPosition` is now `AreaPosition`. The types mirror Telegram, so the old name is gone — update imports.

- 6c01ac9: Upload files that sit inside objects: album items in `send_media_group`, the media of `edit_message_media`, `send_paid_media`, stickers in `create_new_sticker_set` / `add_sticker_to_set` / `replace_sticker_in_set`, `set_my_profile_photo`, story content, and the thumbnails and covers of `InputMedia*`.

  **`@effect-ak/tg-bot-api`** — the 25 fields the docs describe as `attach://<file_attach_name>` uploads are typed `InputFile | string` instead of `string`, so a file can be passed there.

  **`@effect-ak/tg-bot-client`** — a file found inside an object is sent as its own multipart part, and the JSON carries `attach://file<N>` in its place, as the Bot API expects. Before, it was serialized into the JSON and the upload failed.

  ```ts
  await client.execute("send_media_group", {
    chat_id,
    media: [
      { type: "photo", media: { file_content: first, file_name: "1.jpg" } },
      { type: "photo", media: new File([second], "2.jpg") },
    ],
  });
  ```

- 551c1d4: Fix scraper mistakes in the generated types, found by new invariant tests that check the whole spec against the docs.

  - Types the docs describe as "Currently holds no information" were `never`, so they could be neither sent nor read: `{ text, disabled: {} }` (`DisabledButton`, Bot API 10.3) and `callback_game: {}` did not compile, and `message.forum_topic_closed`, `video_chat_started` and the like were typed as always absent. They are now `Record<string, never>`. Affected: `CallbackGame`, `CommunityChatRemoved`, `DisabledButton`, `ForumTopicClosed`, `ForumTopicReopened`, `GeneralForumTopicHidden`, `GeneralForumTopicUnhidden`, `PaidMessagesWaived`, `VideoChatStarted`.
  - `send_media_group`: `media` accepts `InputMediaLivePhoto`. The docs list the members as "A, B, C and D", which the parser now reads; a stale hand-written list had left live photos out.
  - Enums the scraper missed are now enums: `answer_chat_join_request_query` `result`, `send_poll` `type`, `EncryptedPassportElement.type`, `InlineQuery.chat_type`, `WidgetQuery.chat_type`, `InlineQueryResultDocument.mime_type`, `MaskPosition.point`, `UniqueGiftInfo.origin`, and Mini Apps `colorScheme`.
  - Mini Apps signatures now follow the docs: `requestChat` and `Serverless.call` were `unknown`; `requestEmojiStatusAccess` takes only a callback (it was typed with the `url` of `openInvoice`); `shareMessage` takes a string `msg_id`; `switchInlineQuery` takes an array `choose_chat_types`; `shareToStory`, `setEmojiStatus` and `BottomButton.showProgress` use the documented parameters. `EventHandlers` gains `contactRequested` and `secondaryButtonClicked`; `ServerlessCallError` describes the error `Serverless.call` reports.

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
