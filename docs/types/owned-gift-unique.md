# OwnedGiftUnique

Describes a unique gift received and owned by a user or a chat.

[Telegram docs](https://core.telegram.org/bots/api#ownedgiftunique)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"unique"` | Yes | Type of the gift, always “unique” |
| gift | [`UniqueGift`](unique-gift.md) | Yes | Information about the unique gift |
| send_date | `number` | Yes | Date the gift was sent in Unix time |
| owned_gift_id | `string` | No | Unique identifier of the received gift for the bot; for gifts received on behalf of business accounts only |
| sender_user | [`User`](user.md) | No | Sender of the gift if it is a known user |
| is_saved | `boolean` | No | True, if the gift is displayed on the account&#39;s profile page; for gifts received on behalf of business accounts only |
| can_be_transferred | `boolean` | No | True, if the gift can be transferred to another owner; for gifts received on behalf of business accounts only |
| transfer_star_count | `number` | No | Number of Telegram Stars that must be paid to transfer the gift; omitted if the bot cannot transfer the gift |
| next_transfer_date | `number` | No | Point in time (Unix timestamp) when the gift can be transferred If it is in the past, then the gift can be transferred now |
