# InputMediaAnimation

Represents an animation file (GIF or H.264/MPEG-4 AVC video without sound) to be sent.

[Telegram docs](https://core.telegram.org/bots/api#inputmediaanimation)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"animation"` | Yes | Type of the result, must be animation |
| media | `string` | Yes | File to send Pass a file_id to send a file that exists on the Telegram servers (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or pass “attach://&lt;file_attach_name&gt;” to upload a new one using multipart/form-data under &lt;file_attach_name&gt; name More information on Sending Files » |
| thumbnail | `string` | No | Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side The thumbnail should be in JPEG format and less than 200 kB in size A thumbnail&#39;s width and height should not exceed 320 Ignored if the file is not uploaded using multipart/form-data Thumbnails can&#39;t be reused and can be only uploaded as a new file, so you can pass “attach://&lt;file_attach_name&gt;” if the thumbnail was uploaded using multipart/form-data under &lt;file_attach_name&gt; More information on Sending Files » |
| caption | `string` | No | Caption of the animation to be sent, 0-1024 characters after entities parsing |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the animation caption See formatting options for more details. |
| caption_entities | [`MessageEntity`](message-entity.md)[] | No | List of special entities that appear in the caption, which can be specified instead of parse_mode |
| show_caption_above_media | `boolean` | No | Pass True, if the caption must be shown above the message media |
| width | `number` | No | Animation width |
| height | `number` | No | Animation height |
| duration | `number` | No | Animation duration in seconds |
| has_spoiler | `boolean` | No | Pass True if the animation needs to be covered with a spoiler animation |
