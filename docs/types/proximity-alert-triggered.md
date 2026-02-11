# ProximityAlertTriggered

This object represents the content of a service message, sent whenever a user in the chat triggers a proximity alert set by another user.

[Telegram docs](https://core.telegram.org/bots/api#proximityalerttriggered)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| traveler | [`User`](user.md) | Yes | User that triggered the alert |
| watcher | [`User`](user.md) | Yes | User that set the alert |
| distance | `number` | Yes | The distance between the users |
