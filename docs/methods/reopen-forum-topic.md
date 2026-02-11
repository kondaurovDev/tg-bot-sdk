# reopenForumTopic

Use this method to reopen a closed topic in a forum supergroup chat The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights, unless it is the creator of the topic

[Telegram docs](https://core.telegram.org/bots/api#reopenforumtopic)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername) |
| message_thread_id | `number` | Yes | Unique identifier for the target message thread of the forum topic |

## Return type

`boolean`
