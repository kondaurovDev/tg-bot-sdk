# MessageOriginHiddenUser

The message was originally sent by an unknown user.

[Telegram docs](https://core.telegram.org/bots/api#messageoriginhiddenuser)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"hidden_user"` | Yes | Type of the message origin, always “hidden_user” |
| date | `number` | Yes | Date the message was sent originally in Unix time |
| sender_user_name | `string` | Yes | Name of the user that sent the message originally |
