# InputMediaPhoto

Represents a photo to be sent.

[Telegram docs](https://core.telegram.org/bots/api#inputmediaphoto)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"photo"` | Yes | Type of the result, must be photo |
| media | `string` | Yes | File to send Pass a file_id to send a file that exists on the Telegram servers (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or pass “attach://&lt;file_attach_name&gt;” to upload a new one using multipart/form-data under &lt;file_attach_name&gt; name More information on Sending Files » |
| caption | `string` | No | Caption of the photo to be sent, 0-1024 characters after entities parsing |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the photo caption See formatting options for more details. |
| caption_entities | [`MessageEntity`](message-entity.md)[] | No | List of special entities that appear in the caption, which can be specified instead of parse_mode |
| show_caption_above_media | `boolean` | No | Pass True, if the caption must be shown above the message media |
| has_spoiler | `boolean` | No | Pass True if the photo needs to be covered with a spoiler animation |
