# ReactionCount

Represents a reaction added to a message along with the number of times it was added.

[Telegram docs](https://core.telegram.org/bots/api#reactioncount)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | [`ReactionType`](reaction-type.md) | Yes | Type of the reaction |
| total_count | `number` | Yes | Number of times the reaction was added |
