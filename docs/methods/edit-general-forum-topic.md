# editGeneralForumTopic

Use this method to edit the name of the &#39;General&#39; topic in a forum supergroup chat The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights

[Telegram docs](https://core.telegram.org/bots/api#editgeneralforumtopic)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername) |
| name | `string` | Yes | New topic name, 1-128 characters |

## Return type

`boolean`
