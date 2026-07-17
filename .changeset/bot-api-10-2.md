---
"@effect-ak/tg-bot-api": minor
---

Update generated types to Telegram Bot API 10.2

- Rich messages: explicit media via `InputRichMessageMedia` and the `media` field on `InputRichMessage`, new `InputMediaVoiceNote`, block-level content classes (`InputRichBlockParagraph`, `InputRichBlockSectionHeading`, `InputRichBlockList`, `InputRichBlockTable`, `InputRichBlockMathematicalExpression`, and more)
- Ephemeral messages: `edit_ephemeral_message_text`, `edit_ephemeral_message_media`, `edit_ephemeral_message_caption`, `edit_ephemeral_message_reply_markup`, `delete_ephemeral_message`, `is_ephemeral` on `BotCommand`, ephemeral-related fields on `Message`
- Communities: new `Community` class and related message fields (`CommunityChatAdded`)
