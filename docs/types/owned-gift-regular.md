# OwnedGiftRegular

Describes a regular gift owned by a user or a chat.

[Telegram docs](https://core.telegram.org/bots/api#ownedgiftregular)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"regular"` | Yes | Type of the gift, always “regular” |
| gift | [`Gift`](gift.md) | Yes | Information about the regular gift |
| send_date | `number` | Yes | Date the gift was sent in Unix time |
| owned_gift_id | `string` | No | Unique identifier of the gift for the bot; for gifts received on behalf of business accounts only |
| sender_user | [`User`](user.md) | No | Sender of the gift if it is a known user |
| text | `string` | No | Text of the message that was added to the gift |
| entities | [`MessageEntity`](message-entity.md)[] | No | Special entities that appear in the text |
| is_private | `boolean` | No | True, if the sender and gift text are shown only to the gift receiver; otherwise, everyone will be able to see them |
| is_saved | `boolean` | No | True, if the gift is displayed on the account&#39;s profile page; for gifts received on behalf of business accounts only |
| can_be_upgraded | `boolean` | No | True, if the gift can be upgraded to a unique gift; for gifts received on behalf of business accounts only |
| was_refunded | `boolean` | No | True, if the gift was refunded and isn&#39;t available anymore |
| convert_star_count | `number` | No | Number of Telegram Stars that can be claimed by the receiver instead of the gift; omitted if the gift cannot be converted to Telegram Stars |
| prepaid_upgrade_star_count | `number` | No | Number of Telegram Stars that were paid by the sender for the ability to upgrade the gift |
