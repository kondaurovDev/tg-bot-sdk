# InlineQueryResultAudio

Represents a link to an MP3 audio file By default, this audio file will be sent by the user Alternatively, you can use input_message_content to send a message with the specified content instead of the audio.

[Telegram docs](https://core.telegram.org/bots/api#inlinequeryresultaudio)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"audio"` | Yes | Type of the result, must be audio |
| id | `string` | Yes | Unique identifier for this result, 1-64 bytes |
| audio_url | `string` | Yes | A valid URL for the audio file |
| title | `string` | Yes | Title |
| caption | `string` | No | Caption, 0-1024 characters after entities parsing |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the audio caption See formatting options for more details. |
| caption_entities | [`MessageEntity`](message-entity.md)[] | No | List of special entities that appear in the caption, which can be specified instead of parse_mode |
| performer | `string` | No | Performer |
| audio_duration | `number` | No | Audio duration in seconds |
| reply_markup | [`InlineKeyboardMarkup`](inline-keyboard-markup.md) | No | Inline keyboard attached to the message |
| input_message_content | [`InputMessageContent`](input-message-content.md) | No | Content of the message to be sent instead of the audio |
