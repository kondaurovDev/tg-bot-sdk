# approveSuggestedPost

Use this method to approve a suggested post in a direct messages chat The bot must have the &#39;can_post_messages&#39; administrator right in the corresponding channel chat

[Telegram docs](https://core.telegram.org/bots/api#approvesuggestedpost)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` | Yes | Unique identifier for the target direct messages chat |
| message_id | `number` | Yes | Identifier of a suggested post message to approve |
| send_date | `number` | No | Point in time (Unix timestamp) when the post is expected to be published; omit if the date has already been specified when the suggested post was created If specified, then the date must be not more than 2678400 seconds (30 days) in the future |

## Return type

`boolean`
