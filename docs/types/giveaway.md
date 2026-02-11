# Giveaway

This object represents a message about a scheduled giveaway.

[Telegram docs](https://core.telegram.org/bots/api#giveaway)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| chats | [`Chat`](chat.md)[] | Yes | The list of chats which the user must join to participate in the giveaway |
| winners_selection_date | `number` | Yes | Point in time (Unix timestamp) when winners of the giveaway will be selected |
| winner_count | `number` | Yes | The number of users which are supposed to be selected as winners of the giveaway |
| only_new_members | `boolean` | No | True, if only users who join the chats after the giveaway started should be eligible to win |
| has_public_winners | `boolean` | No | True, if the list of giveaway winners will be visible to everyone |
| prize_description | `string` | No | Description of additional giveaway prize |
| country_codes | `string[]` | No | A list of two-letter ISO 3166-1 alpha-2 country codes indicating the countries from which eligible users for the giveaway must come If empty, then all users can participate in the giveaway Users with a phone number that was bought on Fragment can always participate in giveaways. |
| prize_star_count | `number` | No | The number of Telegram Stars to be split between giveaway winners; for Telegram Star giveaways only |
| premium_subscription_month_count | `number` | No | The number of months the Telegram Premium subscription won from the giveaway will be active for; for Telegram Premium giveaways only |
