# declineSuggestedPost

Use this method to decline a suggested post in a direct messages chat The bot must have the &#39;can_manage_direct_messages&#39; administrator right in the corresponding channel chat

[Telegram docs](https://core.telegram.org/bots/api#declinesuggestedpost)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` | Yes | Unique identifier for the target direct messages chat |
| message_id | `number` | Yes | Identifier of a suggested post message to decline |
| comment | `string` | No | Comment for the creator of the suggested post; 0-128 characters |

## Return type

`boolean`
