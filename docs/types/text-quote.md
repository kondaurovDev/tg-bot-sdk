# TextQuote

This object contains information about the quoted part of a message that is replied to by the given message.

[Telegram docs](https://core.telegram.org/bots/api#textquote)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | `string` | Yes | Text of the quoted part of a message that is replied to by the given message |
| position | `number` | Yes | Approximate quote position in the original message in UTF-16 code units as specified by the sender |
| entities | [`MessageEntity`](message-entity.md)[] | No | Special entities that appear in the quote Currently, only bold, italic, underline, strikethrough, spoiler, and custom_emoji entities are kept in quotes. |
| is_manual | `boolean` | No | True, if the quote was chosen manually by the message sender Otherwise, the quote was added automatically by the server. |
