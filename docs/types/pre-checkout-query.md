# PreCheckoutQuery

This object contains information about an incoming pre-checkout query.

[Telegram docs](https://core.telegram.org/bots/api#precheckoutquery)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Unique query identifier |
| from | [`User`](user.md) | Yes | User who sent the query |
| currency | `string` | Yes | Three-letter ISO 4217 currency code, or “XTR” for payments in Telegram Stars |
| total_amount | `number` | Yes | Total price in the smallest units of the currency (integer, not float/double) For example, for a price of US$ 1.45 pass amount = 145 See the exp parameter in currencies.json, it shows the number of digits past the decimal point for each currency (2 for the majority of currencies). |
| invoice_payload | `string` | Yes | Bot-specified invoice payload |
| shipping_option_id | `string` | No | Identifier of the shipping option chosen by the user |
| order_info | [`OrderInfo`](order-info.md) | No | Order information provided by the user |
