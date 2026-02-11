# InputChecklist

Describes a checklist to create.

[Telegram docs](https://core.telegram.org/bots/api#inputchecklist)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | `string` | Yes | Title of the checklist; 1-255 characters after entities parsing |
| tasks | [`InputChecklistTask`](input-checklist-task.md)[] | Yes | List of 1-30 tasks in the checklist |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the title See formatting options for more details. |
| title_entities | [`MessageEntity`](message-entity.md)[] | No | List of special entities that appear in the title, which can be specified instead of parse_mode Currently, only bold, italic, underline, strikethrough, spoiler, and custom_emoji entities are allowed. |
| others_can_add_tasks | `boolean` | No | Pass True if other users can add tasks to the checklist |
| others_can_mark_tasks_as_done | `boolean` | No | Pass True if other users can mark tasks as done or not done in the checklist |
