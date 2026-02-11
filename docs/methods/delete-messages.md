# deleteMessages

Use this method to delete multiple messages simultaneously If some of the specified messages can&#39;t be found, they are skipped

[Telegram docs](https://core.telegram.org/bots/api#deletemessages)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| message_ids | `number[]` | Yes | A JSON-serialized list of 1-100 identifiers of messages to delete See deleteMessage for limitations on which messages can be deleted |

## Return type

`boolean`
