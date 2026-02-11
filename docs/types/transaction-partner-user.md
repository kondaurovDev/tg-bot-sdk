# TransactionPartnerUser

Describes a transaction with a user.

[Telegram docs](https://core.telegram.org/bots/api#transactionpartneruser)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"user"` | Yes | Type of the transaction partner, always “user” |
| transaction_type | `"invoice_payment" | "paid_media_payment" | "gift_purchase" | "premium_purchase" | "business_account_transfer"` | Yes | Type of the transaction, currently one of “invoice_payment” for payments via invoices, “paid_media_payment” for payments for paid media, “gift_purchase” for gifts sent by the bot, “premium_purchase” for Telegram Premium subscriptions gifted by the bot, “business_account_transfer” for direct transfers from managed business accounts |
| user | [`User`](user.md) | Yes | Information about the user |
| affiliate | [`AffiliateInfo`](affiliate-info.md) | No | Information about the affiliate that received a commission via this transaction Can be available only for “invoice_payment” and “paid_media_payment” transactions. |
| invoice_payload | `string` | No | Bot-specified invoice payload Can be available only for “invoice_payment” transactions. |
| subscription_period | `number` | No | The duration of the paid subscription Can be available only for “invoice_payment” transactions. |
| paid_media | [`PaidMedia`](paid-media.md)[] | No | Information about the paid media bought by the user; for “paid_media_payment” transactions only |
| paid_media_payload | `string` | No | Bot-specified paid media payload Can be available only for “paid_media_payment” transactions. |
| gift | [`Gift`](gift.md) | No | The gift sent to the user by the bot; for “gift_purchase” transactions only |
| premium_subscription_duration | `number` | No | Number of months the gifted Telegram Premium subscription will be active for; for “premium_purchase” transactions only |
