# deleteBusinessMessages

Delete messages on behalf of a business account Requires the can_delete_sent_messages business bot right to delete messages sent by the bot itself, or the can_delete_all_messages business bot right to delete any message

[Telegram docs](https://core.telegram.org/bots/api#deletebusinessmessages)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection on behalf of which to delete the messages |
| message_ids | `number[]` | Yes | A JSON-serialized list of 1-100 identifiers of messages to delete All messages must be from the same chat See deleteMessage for limitations on which messages can be deleted |

## Return type

`boolean`
