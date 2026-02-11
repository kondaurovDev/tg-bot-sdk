# PaidMediaInfo

Describes the paid media added to a message.

[Telegram docs](https://core.telegram.org/bots/api#paidmediainfo)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| star_count | `number` | Yes | The number of Telegram Stars that must be paid to buy access to the media |
| paid_media | [`PaidMedia`](paid-media.md)[] | Yes | Information about the paid media |
