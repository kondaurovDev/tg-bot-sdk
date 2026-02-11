# SuggestedPostRefunded

Describes a service message about a payment refund for a suggested post.

[Telegram docs](https://core.telegram.org/bots/api#suggestedpostrefunded)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | `"post_deleted" | "payment_refunded"` | Yes | Reason for the refund Currently, one of “post_deleted” if the post was deleted within 24 hours of being posted or removed from scheduled messages without being posted, or “payment_refunded” if the payer refunded their payment. |
| suggested_post_message | [`Message`](message.md) | No | Message containing the suggested post Note that the Message object in this field will not contain the reply_to_message field even if it itself is a reply. |
