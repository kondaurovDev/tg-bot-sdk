# InlineQueryResultCachedMpeg4Gif

Represents a link to a video animation (H.264/MPEG-4 AVC video without sound) stored on the Telegram servers By default, this animated MPEG-4 file will be sent by the user with an optional caption Alternatively, you can use input_message_content to send a message with the specified content instead of the animation.

[Telegram docs](https://core.telegram.org/bots/api#inlinequeryresultcachedmpeg4gif)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"mpeg4_gif"` | Yes | Type of the result, must be mpeg4_gif |
| id | `string` | Yes | Unique identifier for this result, 1-64 bytes |
| mpeg4_file_id | `string` | Yes | A valid file identifier for the MPEG4 file |
| title | `string` | No | Title for the result |
| caption | `string` | No | Caption of the MPEG-4 file to be sent, 0-1024 characters after entities parsing |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the caption See formatting options for more details. |
| caption_entities | [`MessageEntity`](message-entity.md)[] | No | List of special entities that appear in the caption, which can be specified instead of parse_mode |
| show_caption_above_media | `boolean` | No | Pass True, if the caption must be shown above the message media |
| reply_markup | [`InlineKeyboardMarkup`](inline-keyboard-markup.md) | No | Inline keyboard attached to the message |
| input_message_content | [`InputMessageContent`](input-message-content.md) | No | Content of the message to be sent instead of the video animation |
