# BusinessMessagesDeleted

This object is received when messages are deleted from a connected business account.

[Telegram docs](https://core.telegram.org/bots/api#businessmessagesdeleted)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection |
| chat | [`Chat`](chat.md) | Yes | Information about a chat in the business account The bot may not have access to the chat or the corresponding user. |
| message_ids | `number[]` | Yes | The list of identifiers of deleted messages in the chat of the business account |
