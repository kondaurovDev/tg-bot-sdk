# editMessageMedia

Use this method to edit animation, audio, document, photo, or video messages, or to add media to text messages If a message is part of a message album, then it can be edited only to an audio for audio albums, only to a document for document albums and to a photo or a video otherwise When an inline message is edited, a new file can&#39;t be uploaded; use a previously uploaded file via its file_id or specify a URL Note that business messages that were not sent by the bot and do not contain an inline keyboard can only be edited within 48 hours from the time they were sent.

[Telegram docs](https://core.telegram.org/bots/api#editmessagemedia)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| media | [`InputMedia`](../types/input-media.md) | Yes | A JSON-serialized object for a new media content of the message |
| business_connection_id | `string` | No | Unique identifier of the business connection on behalf of which the message to be edited was sent |
| chat_id | `number` \| `string` | No | Required if inline_message_id is not specified Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| message_id | `number` | No | Required if inline_message_id is not specified Identifier of the message to edit |
| inline_message_id | `string` | No | Required if chat_id and message_id are not specified Identifier of the inline message |
| reply_markup | [`InlineKeyboardMarkup`](../types/inline-keyboard-markup.md) | No | A JSON-serialized object for a new inline keyboard. |

## Return type

[`Message`](../types/message.md) \| `boolean`
