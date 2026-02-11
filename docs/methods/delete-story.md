# deleteStory

Deletes a story previously posted by the bot on behalf of a managed business account Requires the can_manage_stories business bot right

[Telegram docs](https://core.telegram.org/bots/api#deletestory)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection |
| story_id | `number` | Yes | Unique identifier of the story to delete |

## Return type

`boolean`
