# InlineQueryResultArticle

Represents a link to an article or web page.

[Telegram docs](https://core.telegram.org/bots/api#inlinequeryresultarticle)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"article"` | Yes | Type of the result, must be article |
| id | `string` | Yes | Unique identifier for this result, 1-64 Bytes |
| title | `string` | Yes | Title of the result |
| input_message_content | [`InputMessageContent`](input-message-content.md) | Yes | Content of the message to be sent |
| reply_markup | [`InlineKeyboardMarkup`](inline-keyboard-markup.md) | No | Inline keyboard attached to the message |
| url | `string` | No | URL of the result |
| description | `string` | No | Short description of the result |
| thumbnail_url | `string` | No | Url of the thumbnail for the result |
| thumbnail_width | `number` | No | Thumbnail width |
| thumbnail_height | `number` | No | Thumbnail height |
