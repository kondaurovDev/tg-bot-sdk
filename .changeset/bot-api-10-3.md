---
"@effect-ak/tg-bot-api": minor
---

Regenerate types for Telegram Bot API 10.3 (Mini Apps 10.1).

- Rich messages: `RichMessageButton`, `RichTextButton`, `RichBlockButtons` / `InputRichBlockButtons`, `RichBlockExpandableBlockQuotation` / `InputRichBlockExpandableBlockQuotation`, `RichBlockDocument` / `InputRichBlockDocument`, `is_compact` on `RichBlockTable` / `InputRichBlockTable`.
- Ephemeral messages: new `EphemeralMessageParameters` class replaces the `receiver_user_id` and `callback_query_id` parameters across the `send*` methods with a single `ephemeral_message_parameters`.
- Reply markup: `DisabledButton`, `disabled` on `InlineKeyboardButton`, `force_reply` on `InlineKeyboardMarkup` and `ReplyKeyboardMarkup`.
- General: `MessageGenerationStopped` with `Update.stopped_message_generation`, `CommunityChatJoined` with `Message.community_chat_joined`, `can_send_welcome_messages` on admin rights and `promoteChatMember`, `can_stop` / `keep_on_stop` on the draft methods, `text` / `entities` / `is_private` on `UniqueGiftInfo`.

The scraper no longer fails when Telegram publishes a type without any prose description (as it did for `EphemeralMessageParameters`); it emits a `no-description` warning and generates the type from its field table.
