# declineChatJoinRequest

Use this method to decline a chat join request The bot must be an administrator in the chat for this to work and must have the can_invite_users administrator right

[Telegram docs](https://core.telegram.org/bots/api#declinechatjoinrequest)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| user_id | `number` | Yes | Unique identifier of the target user |

## Return type

`boolean`
