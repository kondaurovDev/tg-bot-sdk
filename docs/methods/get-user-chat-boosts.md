# getUserChatBoosts

Use this method to get the list of boosts added to a chat by a user Requires administrator rights in the chat

[Telegram docs](https://core.telegram.org/bots/api#getuserchatboosts)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the chat or username of the channel (in the format @channelusername) |
| user_id | `number` | Yes | Unique identifier of the target user |

## Return type

[`UserChatBoosts`](../types/user-chat-boosts.md)
