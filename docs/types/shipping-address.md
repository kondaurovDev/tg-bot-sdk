# ShippingAddress

This object represents a shipping address.

[Telegram docs](https://core.telegram.org/bots/api#shippingaddress)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| country_code | `string` | Yes | Two-letter ISO 3166-1 alpha-2 country code |
| state | `string` | Yes | State, if applicable |
| city | `string` | Yes | City |
| street_line1 | `string` | Yes | First line for the address |
| street_line2 | `string` | Yes | Second line for the address |
| post_code | `string` | Yes | Address post code |
