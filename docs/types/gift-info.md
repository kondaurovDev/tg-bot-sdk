# GiftInfo

Describes a service message about a regular gift that was sent or received.

[Telegram docs](https://core.telegram.org/bots/api#giftinfo)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| gift | [`Gift`](gift.md) | Yes | Information about the gift |
| owned_gift_id | `string` | No | Unique identifier of the received gift for the bot; only present for gifts received on behalf of business accounts |
| convert_star_count | `number` | No | Number of Telegram Stars that can be claimed by the receiver by converting the gift; omitted if conversion to Telegram Stars is impossible |
| prepaid_upgrade_star_count | `number` | No | Number of Telegram Stars that were prepaid by the sender for the ability to upgrade the gift |
| can_be_upgraded | `boolean` | No | True, if the gift can be upgraded to a unique gift |
| text | `string` | No | Text of the message that was added to the gift |
| entities | [`MessageEntity`](message-entity.md)[] | No | Special entities that appear in the text |
| is_private | `boolean` | No | True, if the sender and gift text are shown only to the gift receiver; otherwise, everyone will be able to see them |
