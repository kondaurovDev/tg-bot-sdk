# ChatBoostRemoved

This object represents a boost removed from a chat.

[Telegram docs](https://core.telegram.org/bots/api#chatboostremoved)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| chat | [`Chat`](chat.md) | Yes | Chat which was boosted |
| boost_id | `string` | Yes | Unique identifier of the boost |
| remove_date | `number` | Yes | Point in time (Unix timestamp) when the boost was removed |
| source | [`ChatBoostSource`](chat-boost-source.md) | Yes | Source of the removed boost |
