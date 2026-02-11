# InlineQueryResultGif

Represents a link to an animated GIF file By default, this animated GIF file will be sent by the user with optional caption Alternatively, you can use input_message_content to send a message with the specified content instead of the animation.

[Telegram docs](https://core.telegram.org/bots/api#inlinequeryresultgif)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"gif"` | Yes | Type of the result, must be gif |
| id | `string` | Yes | Unique identifier for this result, 1-64 bytes |
| gif_url | `string` | Yes | A valid URL for the GIF file |
| thumbnail_url | `string` | Yes | URL of the static (JPEG or GIF) or animated (MPEG4) thumbnail for the result |
| gif_width | `number` | No | Width of the GIF |
| gif_height | `number` | No | Height of the GIF |
| gif_duration | `number` | No | Duration of the GIF in seconds |
| thumbnail_mime_type | `"image/jpeg" | "image/gif" | "video/mp4"` | No | MIME type of the thumbnail, must be one of “image/jpeg”, “image/gif”, or “video/mp4” Defaults to “image/jpeg” |
| title | `string` | No | Title for the result |
| caption | `string` | No | Caption of the GIF file to be sent, 0-1024 characters after entities parsing |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the caption See formatting options for more details. |
| caption_entities | [`MessageEntity`](message-entity.md)[] | No | List of special entities that appear in the caption, which can be specified instead of parse_mode |
| show_caption_above_media | `boolean` | No | Pass True, if the caption must be shown above the message media |
| reply_markup | [`InlineKeyboardMarkup`](inline-keyboard-markup.md) | No | Inline keyboard attached to the message |
| input_message_content | [`InputMessageContent`](input-message-content.md) | No | Content of the message to be sent instead of the GIF animation |
