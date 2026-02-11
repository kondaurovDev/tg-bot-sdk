# InlineQueryResultCachedSticker

Represents a link to a sticker stored on the Telegram servers By default, this sticker will be sent by the user Alternatively, you can use input_message_content to send a message with the specified content instead of the sticker.

[Telegram docs](https://core.telegram.org/bots/api#inlinequeryresultcachedsticker)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"sticker"` | Yes | Type of the result, must be sticker |
| id | `string` | Yes | Unique identifier for this result, 1-64 bytes |
| sticker_file_id | `string` | Yes | A valid file identifier of the sticker |
| reply_markup | [`InlineKeyboardMarkup`](inline-keyboard-markup.md) | No | Inline keyboard attached to the message |
| input_message_content | [`InputMessageContent`](input-message-content.md) | No | Content of the message to be sent instead of the sticker |
