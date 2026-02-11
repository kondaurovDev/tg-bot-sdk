# ReplyParameters

Describes reply parameters for the message that is being sent.

[Telegram docs](https://core.telegram.org/bots/api#replyparameters)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message_id | `number` | Yes | Identifier of the message that will be replied to in the current chat, or in the chat chat_id if it is specified |
| chat_id | `number` \| `string` | No | If the message to be replied to is from a different chat, unique identifier for the chat or username of the channel (in the format @channelusername) Not supported for messages sent on behalf of a business account and messages from channel direct messages chats. |
| allow_sending_without_reply | `boolean` | No | Pass True if the message should be sent even if the specified message to be replied to is not found Always False for replies in another chat or forum topic Always True for messages sent on behalf of a business account. |
| quote | `string` | No | Quoted part of the message to be replied to; 0-1024 characters after entities parsing The quote must be an exact substring of the message to be replied to, including bold, italic, underline, strikethrough, spoiler, and custom_emoji entities The message will fail to send if the quote isn&#39;t found in the original message. |
| quote_parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the quote See formatting options for more details. |
| quote_entities | [`MessageEntity`](message-entity.md)[] | No | A JSON-serialized list of special entities that appear in the quote It can be specified instead of quote_parse_mode. |
| quote_position | `number` | No | Position of the quote in the original message in UTF-16 code units |
| checklist_task_id | `number` | No | Identifier of the specific checklist task to be replied to |
