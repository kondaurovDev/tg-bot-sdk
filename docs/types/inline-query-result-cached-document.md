# InlineQueryResultCachedDocument

Represents a link to a file stored on the Telegram servers By default, this file will be sent by the user with an optional caption Alternatively, you can use input_message_content to send a message with the specified content instead of the file.

[Telegram docs](https://core.telegram.org/bots/api#inlinequeryresultcacheddocument)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"document"` | Yes | Type of the result, must be document |
| id | `string` | Yes | Unique identifier for this result, 1-64 bytes |
| title | `string` | Yes | Title for the result |
| document_file_id | `string` | Yes | A valid file identifier for the file |
| description | `string` | No | Short description of the result |
| caption | `string` | No | Caption of the document to be sent, 0-1024 characters after entities parsing |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the document caption See formatting options for more details. |
| caption_entities | [`MessageEntity`](message-entity.md)[] | No | List of special entities that appear in the caption, which can be specified instead of parse_mode |
| reply_markup | [`InlineKeyboardMarkup`](inline-keyboard-markup.md) | No | Inline keyboard attached to the message |
| input_message_content | [`InputMessageContent`](input-message-content.md) | No | Content of the message to be sent instead of the file |
