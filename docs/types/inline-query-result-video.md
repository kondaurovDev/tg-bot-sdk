# InlineQueryResultVideo

Represents a link to a page containing an embedded video player or a video file By default, this video file will be sent by the user with an optional caption Alternatively, you can use input_message_content to send a message with the specified content instead of the video. 
If an InlineQueryResultVideo message contains an embedded video (e.g., YouTube), you must replace its content using input_message_content.


[Telegram docs](https://core.telegram.org/bots/api#inlinequeryresultvideo)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"video"` | Yes | Type of the result, must be video |
| id | `string` | Yes | Unique identifier for this result, 1-64 bytes |
| video_url | `string` | Yes | A valid URL for the embedded video player or video file |
| mime_type | `string` | Yes | MIME type of the content of the video URL, “text/html” or “video/mp4” |
| thumbnail_url | `string` | Yes | URL of the thumbnail (JPEG only) for the video |
| title | `string` | Yes | Title for the result |
| caption | `string` | No | Caption of the video to be sent, 0-1024 characters after entities parsing |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the video caption See formatting options for more details. |
| caption_entities | [`MessageEntity`](message-entity.md)[] | No | List of special entities that appear in the caption, which can be specified instead of parse_mode |
| show_caption_above_media | `boolean` | No | Pass True, if the caption must be shown above the message media |
| video_width | `number` | No | Video width |
| video_height | `number` | No | Video height |
| video_duration | `number` | No | Video duration in seconds |
| description | `string` | No | Short description of the result |
| reply_markup | [`InlineKeyboardMarkup`](inline-keyboard-markup.md) | No | Inline keyboard attached to the message |
| input_message_content | [`InputMessageContent`](input-message-content.md) | No | Content of the message to be sent instead of the video This field is required if InlineQueryResultVideo is used to send an HTML-page as a result (e.g., a YouTube video). |
