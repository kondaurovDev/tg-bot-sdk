# MessageOriginChannel

The message was originally sent to a channel chat.

[Telegram docs](https://core.telegram.org/bots/api#messageoriginchannel)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"channel"` | Yes | Type of the message origin, always “channel” |
| date | `number` | Yes | Date the message was sent originally in Unix time |
| chat | [`Chat`](chat.md) | Yes | Channel chat to which the message was originally sent |
| message_id | `number` | Yes | Unique message identifier inside the chat |
| author_signature | `string` | No | Signature of the original post author |
