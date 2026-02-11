# InputChecklistTask

Describes a task to add to a checklist.

[Telegram docs](https://core.telegram.org/bots/api#inputchecklisttask)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `number` | Yes | Unique identifier of the task; must be positive and unique among all task identifiers currently present in the checklist |
| text | `string` | Yes | Text of the task; 1-100 characters after entities parsing |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the text See formatting options for more details. |
| text_entities | [`MessageEntity`](message-entity.md)[] | No | List of special entities that appear in the text, which can be specified instead of parse_mode Currently, only bold, italic, underline, strikethrough, spoiler, and custom_emoji entities are allowed. |
