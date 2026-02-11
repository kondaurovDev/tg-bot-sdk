# MessageId

This object represents a unique message identifier.

[Telegram docs](https://core.telegram.org/bots/api#messageid)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message_id | `number` | Yes | Unique message identifier In specific instances (e.g., message containing a video sent to a big chat), the server might automatically schedule a message instead of sending it immediately In such cases, this field will be 0 and the relevant message will be unusable until it is actually sent |
