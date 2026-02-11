# OwnedGifts

Contains the list of gifts received and owned by a user or a chat.

[Telegram docs](https://core.telegram.org/bots/api#ownedgifts)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| total_count | `number` | Yes | The total number of gifts owned by the user or the chat |
| gifts | [`OwnedGift`](owned-gift.md)[] | Yes | The list of gifts |
| next_offset | `string` | No | Offset for the next request If empty, then there are no more results |
