# TransactionPartnerAffiliateProgram

Describes the affiliate program that issued the affiliate commission received via this transaction.

[Telegram docs](https://core.telegram.org/bots/api#transactionpartneraffiliateprogram)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"affiliate_program"` | Yes | Type of the transaction partner, always “affiliate_program” |
| commission_per_mille | `number` | Yes | The number of Telegram Stars received by the bot for each 1000 Telegram Stars received by the affiliate program sponsor from referred users |
| sponsor_user | [`User`](user.md) | No | Information about the bot that sponsored the affiliate program |
