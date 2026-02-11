# AffiliateInfo

Contains information about the affiliate that received a commission via this transaction.

[Telegram docs](https://core.telegram.org/bots/api#affiliateinfo)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| commission_per_mille | `number` | Yes | The number of Telegram Stars received by the affiliate for each 1000 Telegram Stars received by the bot from referred users |
| amount | `number` | Yes | Integer amount of Telegram Stars received by the affiliate from the transaction, rounded to 0; can be negative for refunds |
| affiliate_user | [`User`](user.md) | No | The bot or the user that received an affiliate commission if it was received by a bot or a user |
| affiliate_chat | [`Chat`](chat.md) | No | The chat that received an affiliate commission if it was received by a chat |
| nanostar_amount | `number` | No | The number of 1/1000000000 shares of Telegram Stars received by the affiliate; from -999999999 to 999999999; can be negative for refunds |
