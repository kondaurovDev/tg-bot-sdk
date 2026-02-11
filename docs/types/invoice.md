# Invoice

This object contains basic information about an invoice.

[Telegram docs](https://core.telegram.org/bots/api#invoice)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | `string` | Yes | Product name |
| description | `string` | Yes | Product description |
| start_parameter | `string` | Yes | Unique bot deep-linking parameter that can be used to generate this invoice |
| currency | `string` | Yes | Three-letter ISO 4217 currency code, or “XTR” for payments in Telegram Stars |
| total_amount | `number` | Yes | Total price in the smallest units of the currency (integer, not float/double) For example, for a price of US$ 1.45 pass amount = 145 See the exp parameter in currencies.json, it shows the number of digits past the decimal point for each currency (2 for the majority of currencies). |
