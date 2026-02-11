# InlineQueryResultCachedAudio

Represents a link to an MP3 audio file stored on the Telegram servers By default, this audio file will be sent by the user Alternatively, you can use input_message_content to send a message with the specified content instead of the audio.

[Telegram docs](https://core.telegram.org/bots/api#inlinequeryresultcachedaudio)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"audio"` | Yes | Type of the result, must be audio |
| id | `string` | Yes | Unique identifier for this result, 1-64 bytes |
| audio_file_id | `string` | Yes | A valid file identifier for the audio file |
| caption | `string` | No | Caption, 0-1024 characters after entities parsing |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the audio caption See formatting options for more details. |
| caption_entities | [`MessageEntity`](message-entity.md)[] | No | List of special entities that appear in the caption, which can be specified instead of parse_mode |
| reply_markup | [`InlineKeyboardMarkup`](inline-keyboard-markup.md) | No | Inline keyboard attached to the message |
| input_message_content | [`InputMessageContent`](input-message-content.md) | No | Content of the message to be sent instead of the audio |
