# editMessageText

Use this method to edit text and game messages Note that business messages that were not sent by the bot and do not contain an inline keyboard can only be edited within 48 hours from the time they were sent.

[Telegram docs](https://core.telegram.org/bots/api#editmessagetext)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| text | `string` | Yes | New text of the message, 1-4096 characters after entities parsing |
| business_connection_id | `string` | No | Unique identifier of the business connection on behalf of which the message to be edited was sent |
| chat_id | `number` \| `string` | No | Required if inline_message_id is not specified Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| message_id | `number` | No | Required if inline_message_id is not specified Identifier of the message to edit |
| inline_message_id | `string` | No | Required if chat_id and message_id are not specified Identifier of the inline message |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the message text See formatting options for more details. |
| entities | [`MessageEntity`](../types/message-entity.md)[] | No | A JSON-serialized list of special entities that appear in message text, which can be specified instead of parse_mode |
| link_preview_options | [`LinkPreviewOptions`](../types/link-preview-options.md) | No | Link preview generation options for the message |
| reply_markup | [`InlineKeyboardMarkup`](../types/inline-keyboard-markup.md) | No | A JSON-serialized object for an inline keyboard. |

## Return type

[`Message`](../types/message.md) \| `boolean`
