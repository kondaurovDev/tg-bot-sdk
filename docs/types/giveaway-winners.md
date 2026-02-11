# GiveawayWinners

This object represents a message about the completion of a giveaway with public winners.

[Telegram docs](https://core.telegram.org/bots/api#giveawaywinners)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| chat | [`Chat`](chat.md) | Yes | The chat that created the giveaway |
| giveaway_message_id | `number` | Yes | Identifier of the message with the giveaway in the chat |
| winners_selection_date | `number` | Yes | Point in time (Unix timestamp) when winners of the giveaway were selected |
| winner_count | `number` | Yes | Total number of winners in the giveaway |
| winners | [`User`](user.md)[] | Yes | List of up to 100 winners of the giveaway |
| additional_chat_count | `number` | No | The number of other chats the user had to join in order to be eligible for the giveaway |
| prize_star_count | `number` | No | The number of Telegram Stars that were split between giveaway winners; for Telegram Star giveaways only |
| premium_subscription_month_count | `number` | No | The number of months the Telegram Premium subscription won from the giveaway will be active for; for Telegram Premium giveaways only |
| unclaimed_prize_count | `number` | No | Number of undistributed prizes |
| only_new_members | `boolean` | No | True, if only users who had joined the chats after the giveaway started were eligible to win |
| was_refunded | `boolean` | No | True, if the giveaway was canceled because the payment for it was refunded |
| prize_description | `string` | No | Description of additional giveaway prize |
