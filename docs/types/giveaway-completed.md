# GiveawayCompleted

This object represents a service message about the completion of a giveaway without public winners.

[Telegram docs](https://core.telegram.org/bots/api#giveawaycompleted)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| winner_count | `number` | Yes | Number of winners in the giveaway |
| unclaimed_prize_count | `number` | No | Number of undistributed prizes |
| giveaway_message | [`Message`](message.md) | No | Message with the giveaway that was completed, if it wasn&#39;t deleted |
| is_star_giveaway | `boolean` | No | True, if the giveaway is a Telegram Star giveaway Otherwise, currently, the giveaway is a Telegram Premium giveaway. |
