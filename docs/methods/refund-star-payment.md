# refundStarPayment

Refunds a successful payment in Telegram Stars

[Telegram docs](https://core.telegram.org/bots/api#refundstarpayment)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | `number` | Yes | Identifier of the user whose payment will be refunded |
| telegram_payment_charge_id | `string` | Yes | Telegram payment identifier |

## Return type

`boolean`
