# TransactionPartnerTelegramApi

Describes a transaction with payment for paid broadcasting.

[Telegram docs](https://core.telegram.org/bots/api#transactionpartnertelegramapi)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"telegram_api"` | Yes | Type of the transaction partner, always “telegram_api” |
| request_count | `number` | Yes | The number of successful requests that exceeded regular limits and were therefore billed |
