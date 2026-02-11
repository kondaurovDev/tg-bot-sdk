# InlineQueryResultMpeg4Gif

Represents a link to a video animation (H.264/MPEG-4 AVC video without sound) By default, this animated MPEG-4 file will be sent by the user with optional caption Alternatively, you can use input_message_content to send a message with the specified content instead of the animation.

[Telegram docs](https://core.telegram.org/bots/api#inlinequeryresultmpeg4gif)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"mpeg4_gif"` | Yes | Type of the result, must be mpeg4_gif |
| id | `string` | Yes | Unique identifier for this result, 1-64 bytes |
| mpeg4_url | `string` | Yes | A valid URL for the MPEG4 file |
| thumbnail_url | `string` | Yes | URL of the static (JPEG or GIF) or animated (MPEG4) thumbnail for the result |
| mpeg4_width | `number` | No | Video width |
| mpeg4_height | `number` | No | Video height |
| mpeg4_duration | `number` | No | Video duration in seconds |
| thumbnail_mime_type | `"image/jpeg" | "image/gif" | "video/mp4"` | No | MIME type of the thumbnail, must be one of “image/jpeg”, “image/gif”, or “video/mp4” Defaults to “image/jpeg” |
| title | `string` | No | Title for the result |
| caption | `string` | No | Caption of the MPEG-4 file to be sent, 0-1024 characters after entities parsing |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the caption See formatting options for more details. |
| caption_entities | [`MessageEntity`](message-entity.md)[] | No | List of special entities that appear in the caption, which can be specified instead of parse_mode |
| show_caption_above_media | `boolean` | No | Pass True, if the caption must be shown above the message media |
| reply_markup | [`InlineKeyboardMarkup`](inline-keyboard-markup.md) | No | Inline keyboard attached to the message |
| input_message_content | [`InputMessageContent`](input-message-content.md) | No | Content of the message to be sent instead of the video animation |
