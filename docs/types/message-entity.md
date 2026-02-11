# MessageEntity

This object represents one special entity in a text message For example, hashtags, usernames, URLs, etc.

[Telegram docs](https://core.telegram.org/bots/api#messageentity)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"mention" | "hashtag" | "cashtag" | "bot_command" | "url" | "email" | "phone_number" | "bold" | "italic" | "underline" | "strikethrough" | "spoiler" | "blockquote" | "expandable_blockquote" | "code" | "pre" | "text_link" | "text_mention" | "custom_emoji"` | Yes | Type of the entity Currently, can be “mention” (@username), “hashtag” (#hashtag or #hashtag@chatusername), “cashtag” ($USD or $USD@chatusername), “bot_command” (/start@jobs_bot), “url” (https://telegram.org), “email” (do-not-reply@telegram.org), “phone_number” (+1-212-555-0123), “bold” (bold text), “italic” (italic text), “underline” (underlined text), “strikethrough” (strikethrough text), “spoiler” (spoiler message), “blockquote” (block quotation), “expandable_blockquote” (collapsed-by-default block quotation), “code” (monowidth string), “pre” (monowidth block), “text_link” (for clickable text URLs), “text_mention” (for users without usernames), “custom_emoji” (for inline custom emoji stickers) |
| offset | `number` | Yes | Offset in UTF-16 code units to the start of the entity |
| length | `number` | Yes | Length of the entity in UTF-16 code units |
| url | `string` | No | For “text_link” only, URL that will be opened after user taps on the text |
| user | [`User`](user.md) | No | For “text_mention” only, the mentioned user |
| language | `string` | No | For “pre” only, the programming language of the entity text |
| custom_emoji_id | `string` | No | For “custom_emoji” only, unique identifier of the custom emoji Use getCustomEmojiStickers to get full information about the sticker |
