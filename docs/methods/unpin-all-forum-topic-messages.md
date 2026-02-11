# unpinAllForumTopicMessages

Use this method to clear the list of pinned messages in a forum topic The bot must be an administrator in the chat for this to work and must have the can_pin_messages administrator right in the supergroup

[Telegram docs](https://core.telegram.org/bots/api#unpinallforumtopicmessages)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername) |
| message_thread_id | `number` | Yes | Unique identifier for the target message thread of the forum topic |

## Return type

`boolean`
