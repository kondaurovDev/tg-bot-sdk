# getChatMember

Use this method to get information about a member of a chat The method is only guaranteed to work for other users if the bot is an administrator in the chat

[Telegram docs](https://core.telegram.org/bots/api#getchatmember)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target supergroup or channel (in the format @channelusername) |
| user_id | `number` | Yes | Unique identifier of the target user |

## Return type

[`ChatMember`](../types/chat-member.md)
