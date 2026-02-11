# ShippingQuery

This object contains information about an incoming shipping query.

[Telegram docs](https://core.telegram.org/bots/api#shippingquery)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Unique query identifier |
| from | [`User`](user.md) | Yes | User who sent the query |
| invoice_payload | `string` | Yes | Bot-specified invoice payload |
| shipping_address | [`ShippingAddress`](shipping-address.md) | Yes | User specified shipping address |
