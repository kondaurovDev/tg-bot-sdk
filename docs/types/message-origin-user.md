# MessageOriginUser

The message was originally sent by a known user.

[Telegram docs](https://core.telegram.org/bots/api#messageoriginuser)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"user"` | Yes | Type of the message origin, always “user” |
| date | `number` | Yes | Date the message was sent originally in Unix time |
| sender_user | [`User`](user.md) | Yes | User that sent the message originally |
