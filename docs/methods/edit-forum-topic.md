# editForumTopic

Use this method to edit name and icon of a topic in a forum supergroup chat The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights, unless it is the creator of the topic

[Telegram docs](https://core.telegram.org/bots/api#editforumtopic)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername) |
| message_thread_id | `number` | Yes | Unique identifier for the target message thread of the forum topic |
| name | `string` | No | New topic name, 0-128 characters If not specified or empty, the current name of the topic will be kept |
| icon_custom_emoji_id | `string` | No | New unique identifier of the custom emoji shown as the topic icon Use getForumTopicIconStickers to get all allowed custom emoji identifiers Pass an empty string to remove the icon If not specified, the current icon will be kept |

## Return type

`boolean`
