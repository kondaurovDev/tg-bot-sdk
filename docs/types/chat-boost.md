# ChatBoost

This object contains information about a chat boost.

[Telegram docs](https://core.telegram.org/bots/api#chatboost)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| boost_id | `string` | Yes | Unique identifier of the boost |
| add_date | `number` | Yes | Point in time (Unix timestamp) when the chat was boosted |
| expiration_date | `number` | Yes | Point in time (Unix timestamp) when the boost will automatically expire, unless the booster&#39;s Telegram Premium subscription is prolonged |
| source | [`ChatBoostSource`](chat-boost-source.md) | Yes | Source of the added boost |
