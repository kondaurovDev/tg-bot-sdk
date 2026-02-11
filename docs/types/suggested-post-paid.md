# SuggestedPostPaid

Describes a service message about a successful payment for a suggested post.

[Telegram docs](https://core.telegram.org/bots/api#suggestedpostpaid)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currency | `"XTR" | "TON"` | Yes | Currency in which the payment was made Currently, one of “XTR” for Telegram Stars or “TON” for toncoins |
| suggested_post_message | [`Message`](message.md) | No | Message containing the suggested post Note that the Message object in this field will not contain the reply_to_message field even if it itself is a reply. |
| amount | `number` | No | The amount of the currency that was received by the channel in nanotoncoins; for payments in toncoins only |
| star_amount | [`StarAmount`](star-amount.md) | No | The amount of Telegram Stars that was received by the channel; for payments in Telegram Stars only |
