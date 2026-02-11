# readBusinessMessage

Marks incoming message as read on behalf of a business account Requires the can_read_messages business bot right

[Telegram docs](https://core.telegram.org/bots/api#readbusinessmessage)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection on behalf of which to read the message |
| chat_id | `number` | Yes | Unique identifier of the chat in which the message was received The chat must have been active in the last 24 hours. |
| message_id | `number` | Yes | Unique identifier of the message to mark as read |

## Return type

`boolean`
