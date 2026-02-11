# editMessageCaption

Use this method to edit captions of messages Note that business messages that were not sent by the bot and do not contain an inline keyboard can only be edited within 48 hours from the time they were sent.

[Telegram docs](https://core.telegram.org/bots/api#editmessagecaption)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | No | Unique identifier of the business connection on behalf of which the message to be edited was sent |
| chat_id | `number` \| `string` | No | Required if inline_message_id is not specified Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| message_id | `number` | No | Required if inline_message_id is not specified Identifier of the message to edit |
| inline_message_id | `string` | No | Required if chat_id and message_id are not specified Identifier of the inline message |
| caption | `string` | No | New caption of the message, 0-1024 characters after entities parsing |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the message caption See formatting options for more details. |
| caption_entities | [`MessageEntity`](../types/message-entity.md)[] | No | A JSON-serialized list of special entities that appear in the caption, which can be specified instead of parse_mode |
| show_caption_above_media | `boolean` | No | Pass True, if the caption must be shown above the message media Supported only for animation, photo and video messages. |
| reply_markup | [`InlineKeyboardMarkup`](../types/inline-keyboard-markup.md) | No | A JSON-serialized object for an inline keyboard. |

## Return type

[`Message`](../types/message.md) \| `boolean`
