# DirectMessagesTopic

Describes a topic of a direct messages chat.

[Telegram docs](https://core.telegram.org/bots/api#directmessagestopic)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| topic_id | `number` | Yes | Unique identifier of the topic This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it But it has at most 52 significant bits, so a 64-bit integer or double-precision float type are safe for storing this identifier. |
| user | [`User`](user.md) | No | Information about the user that created the topic Currently, it is always present |
