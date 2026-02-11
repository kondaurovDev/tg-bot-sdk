# PreparedInlineMessage

Describes an inline message to be sent by a user of a Mini App.

[Telegram docs](https://core.telegram.org/bots/api#preparedinlinemessage)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Unique identifier of the prepared message |
| expiration_date | `number` | Yes | Expiration date of the prepared message, in Unix time Expired prepared messages can no longer be used |
