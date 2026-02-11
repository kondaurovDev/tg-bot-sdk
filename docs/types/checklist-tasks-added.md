# ChecklistTasksAdded

Describes a service message about tasks added to a checklist.

[Telegram docs](https://core.telegram.org/bots/api#checklisttasksadded)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tasks | [`ChecklistTask`](checklist-task.md)[] | Yes | List of tasks added to the checklist |
| checklist_message | [`Message`](message.md) | No | Message containing the checklist to which the tasks were added Note that the Message object in this field will not contain the reply_to_message field even if it itself is a reply. |
