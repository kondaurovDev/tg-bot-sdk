# InlineQueryResultVoice

Represents a link to a voice recording in an .OGG container encoded with OPUS By default, this voice recording will be sent by the user Alternatively, you can use input_message_content to send a message with the specified content instead of the the voice message.

[Telegram docs](https://core.telegram.org/bots/api#inlinequeryresultvoice)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"voice"` | Yes | Type of the result, must be voice |
| id | `string` | Yes | Unique identifier for this result, 1-64 bytes |
| voice_url | `string` | Yes | A valid URL for the voice recording |
| title | `string` | Yes | Recording title |
| caption | `string` | No | Caption, 0-1024 characters after entities parsing |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the voice message caption See formatting options for more details. |
| caption_entities | [`MessageEntity`](message-entity.md)[] | No | List of special entities that appear in the caption, which can be specified instead of parse_mode |
| voice_duration | `number` | No | Recording duration in seconds |
| reply_markup | [`InlineKeyboardMarkup`](inline-keyboard-markup.md) | No | Inline keyboard attached to the message |
| input_message_content | [`InputMessageContent`](input-message-content.md) | No | Content of the message to be sent instead of the voice recording |
