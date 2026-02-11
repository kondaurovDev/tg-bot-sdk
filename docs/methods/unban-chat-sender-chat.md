# unbanChatSenderChat

Use this method to unban a previously banned channel chat in a supergroup or channel The bot must be an administrator for this to work and must have the appropriate administrator rights

[Telegram docs](https://core.telegram.org/bots/api#unbanchatsenderchat)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| sender_chat_id | `number` | Yes | Unique identifier of the target sender chat |

## Return type

`boolean`
