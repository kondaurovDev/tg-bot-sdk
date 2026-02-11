# InaccessibleMessage

This object describes a message that was deleted or is otherwise inaccessible to the bot.

[Telegram docs](https://core.telegram.org/bots/api#inaccessiblemessage)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| chat | [`Chat`](chat.md) | Yes | Chat the message belonged to |
| message_id | `number` | Yes | Unique message identifier inside the chat |
| date | `number` | Yes | Always 0 The field can be used to differentiate regular and inaccessible messages. |
