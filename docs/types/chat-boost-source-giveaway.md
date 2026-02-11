# ChatBoostSourceGiveaway

The boost was obtained by the creation of a Telegram Premium or a Telegram Star giveaway This boosts the chat 4 times for the duration of the corresponding Telegram Premium subscription for Telegram Premium giveaways and prize_star_count / 500 times for one year for Telegram Star giveaways.

[Telegram docs](https://core.telegram.org/bots/api#chatboostsourcegiveaway)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| source | `"giveaway"` | Yes | Source of the boost, always “giveaway” |
| giveaway_message_id | `number` | Yes | Identifier of a message in the chat with the giveaway; the message could have been deleted already May be 0 if the message isn&#39;t sent yet. |
| user | [`User`](user.md) | No | User that won the prize in the giveaway if any; for Telegram Premium giveaways only |
| prize_star_count | `number` | No | The number of Telegram Stars to be split between giveaway winners; for Telegram Star giveaways only |
| is_unclaimed | `boolean` | No | True, if the giveaway was completed, but there was no user to win the prize |
