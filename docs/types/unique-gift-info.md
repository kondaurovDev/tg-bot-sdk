# UniqueGiftInfo

Describes a service message about a unique gift that was sent or received.

[Telegram docs](https://core.telegram.org/bots/api#uniquegiftinfo)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| gift | [`UniqueGift`](unique-gift.md) | Yes | Information about the gift |
| origin | `string` | Yes | Origin of the gift Currently, either “upgrade” for gifts upgraded from regular gifts, “transfer” for gifts transferred from other users or channels, or “resale” for gifts bought from other users |
| last_resale_star_count | `number` | No | For gifts bought from other users, the price paid for the gift |
| owned_gift_id | `string` | No | Unique identifier of the received gift for the bot; only present for gifts received on behalf of business accounts |
| transfer_star_count | `number` | No | Number of Telegram Stars that must be paid to transfer the gift; omitted if the bot cannot transfer the gift |
| next_transfer_date | `number` | No | Point in time (Unix timestamp) when the gift can be transferred If it is in the past, then the gift can be transferred now |
