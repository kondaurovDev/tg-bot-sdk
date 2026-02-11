# MessageOriginChat

The message was originally sent on behalf of a chat to a group chat.

[Telegram docs](https://core.telegram.org/bots/api#messageoriginchat)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"chat"` | Yes | Type of the message origin, always “chat” |
| date | `number` | Yes | Date the message was sent originally in Unix time |
| sender_chat | [`Chat`](chat.md) | Yes | Chat that sent the message originally |
| author_signature | `string` | No | For messages originally sent by an anonymous chat administrator, original message author signature |
