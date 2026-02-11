# InlineQueryResultCachedPhoto

Represents a link to a photo stored on the Telegram servers By default, this photo will be sent by the user with an optional caption Alternatively, you can use input_message_content to send a message with the specified content instead of the photo.

[Telegram docs](https://core.telegram.org/bots/api#inlinequeryresultcachedphoto)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"photo"` | Yes | Type of the result, must be photo |
| id | `string` | Yes | Unique identifier for this result, 1-64 bytes |
| photo_file_id | `string` | Yes | A valid file identifier of the photo |
| title | `string` | No | Title for the result |
| description | `string` | No | Short description of the result |
| caption | `string` | No | Caption of the photo to be sent, 0-1024 characters after entities parsing |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the photo caption See formatting options for more details. |
| caption_entities | [`MessageEntity`](message-entity.md)[] | No | List of special entities that appear in the caption, which can be specified instead of parse_mode |
| show_caption_above_media | `boolean` | No | Pass True, if the caption must be shown above the message media |
| reply_markup | [`InlineKeyboardMarkup`](inline-keyboard-markup.md) | No | Inline keyboard attached to the message |
| input_message_content | [`InputMessageContent`](input-message-content.md) | No | Content of the message to be sent instead of the photo |
