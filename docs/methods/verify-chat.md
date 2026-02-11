# verifyChat

Verifies a chat on behalf of the organization which is represented by the bot

[Telegram docs](https://core.telegram.org/bots/api#verifychat)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) Channel direct messages chats can&#39;t be verified. |
| custom_description | `string` | No | Custom description for the verification; 0-70 characters Must be empty if the organization isn&#39;t allowed to provide a custom verification description. |

## Return type

`boolean`
