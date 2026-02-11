# InlineQueryResultDocument

Represents a link to a file By default, this file will be sent by the user with an optional caption Alternatively, you can use input_message_content to send a message with the specified content instead of the file Currently, only .PDF and .ZIP files can be sent using this method.

[Telegram docs](https://core.telegram.org/bots/api#inlinequeryresultdocument)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"document"` | Yes | Type of the result, must be document |
| id | `string` | Yes | Unique identifier for this result, 1-64 bytes |
| title | `string` | Yes | Title for the result |
| document_url | `string` | Yes | A valid URL for the file |
| mime_type | `string` | Yes | MIME type of the content of the file, either “application/pdf” or “application/zip” |
| caption | `string` | No | Caption of the document to be sent, 0-1024 characters after entities parsing |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the document caption See formatting options for more details. |
| caption_entities | [`MessageEntity`](message-entity.md)[] | No | List of special entities that appear in the caption, which can be specified instead of parse_mode |
| description | `string` | No | Short description of the result |
| reply_markup | [`InlineKeyboardMarkup`](inline-keyboard-markup.md) | No | Inline keyboard attached to the message |
| input_message_content | [`InputMessageContent`](input-message-content.md) | No | Content of the message to be sent instead of the file |
| thumbnail_url | `string` | No | URL of the thumbnail (JPEG only) for the file |
| thumbnail_width | `number` | No | Thumbnail width |
| thumbnail_height | `number` | No | Thumbnail height |
