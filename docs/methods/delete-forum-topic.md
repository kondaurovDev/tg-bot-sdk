# deleteForumTopic

Use this method to delete a forum topic along with all its messages in a forum supergroup chat The bot must be an administrator in the chat for this to work and must have the can_delete_messages administrator rights

[Telegram docs](https://core.telegram.org/bots/api#deleteforumtopic)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername) |
| message_thread_id | `number` | Yes | Unique identifier for the target message thread of the forum topic |

## Return type

`boolean`
