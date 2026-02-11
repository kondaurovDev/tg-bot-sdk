# exportChatInviteLink

Use this method to generate a new primary invite link for a chat; any previously generated primary link is revoked The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights

[Telegram docs](https://core.telegram.org/bots/api#exportchatinvitelink)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |

## Return type

`string`
