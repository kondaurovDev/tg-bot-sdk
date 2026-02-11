# SuccessfulPayment

This object contains basic information about a successful payment Note that if the buyer initiates a chargeback with the relevant payment provider following this transaction, the funds may be debited from your balance This is outside of Telegram&#39;s control.

[Telegram docs](https://core.telegram.org/bots/api#successfulpayment)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currency | `string` | Yes | Three-letter ISO 4217 currency code, or “XTR” for payments in Telegram Stars |
| total_amount | `number` | Yes | Total price in the smallest units of the currency (integer, not float/double) For example, for a price of US$ 1.45 pass amount = 145 See the exp parameter in currencies.json, it shows the number of digits past the decimal point for each currency (2 for the majority of currencies). |
| invoice_payload | `string` | Yes | Bot-specified invoice payload |
| telegram_payment_charge_id | `string` | Yes | Telegram payment identifier |
| provider_payment_charge_id | `string` | Yes | Provider payment identifier |
| subscription_expiration_date | `number` | No | Expiration date of the subscription, in Unix time; for recurring payments only |
| is_recurring | `boolean` | No | True, if the payment is a recurring payment for a subscription |
| is_first_recurring | `boolean` | No | True, if the payment is the first payment for a subscription |
| shipping_option_id | `string` | No | Identifier of the shipping option chosen by the user |
| order_info | [`OrderInfo`](order-info.md) | No | Order information provided by the user |
