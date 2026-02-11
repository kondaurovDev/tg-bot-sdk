# createInvoiceLink

Use this method to create a link for an invoice

[Telegram docs](https://core.telegram.org/bots/api#createinvoicelink)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | `string` | Yes | Product name, 1-32 characters |
| description | `string` | Yes | Product description, 1-255 characters |
| payload | `string` | Yes | Bot-defined invoice payload, 1-128 bytes This will not be displayed to the user, use it for your internal processes. |
| currency | `string` | Yes | Three-letter ISO 4217 currency code, see more on currencies Pass “XTR” for payments in Telegram Stars. |
| prices | [`LabeledPrice`](../types/labeled-price.md)[] | Yes | Price breakdown, a JSON-serialized list of components (e.g product price, tax, discount, delivery cost, delivery tax, bonus, etc.) Must contain exactly one item for payments in Telegram Stars. |
| business_connection_id | `string` | No | Unique identifier of the business connection on behalf of which the link will be created For payments in Telegram Stars only. |
| provider_token | `string` | No | Payment provider token, obtained via @BotFather Pass an empty string for payments in Telegram Stars. |
| subscription_period | `number` | No | The number of seconds the subscription will be active for before the next payment The currency must be set to “XTR” (Telegram Stars) if the parameter is used Currently, it must always be 2592000 (30 days) if specified Any number of subscriptions can be active for a given bot at the same time, including multiple concurrent subscriptions from the same user Subscription price must no exceed 10000 Telegram Stars. |
| max_tip_amount | `number` | No | The maximum accepted amount for tips in the smallest units of the currency (integer, not float/double) For example, for a maximum tip of US$ 1.45 pass max_tip_amount = 145 See the exp parameter in currencies.json, it shows the number of digits past the decimal point for each currency (2 for the majority of currencies) Defaults to 0 Not supported for payments in Telegram Stars. |
| suggested_tip_amounts | `number[]` | No | A JSON-serialized array of suggested amounts of tips in the smallest units of the currency (integer, not float/double) At most 4 suggested tip amounts can be specified The suggested tip amounts must be positive, passed in a strictly increased order and must not exceed max_tip_amount. |
| provider_data | `string` | No | JSON-serialized data about the invoice, which will be shared with the payment provider A detailed description of required fields should be provided by the payment provider. |
| photo_url | `string` | No | URL of the product photo for the invoice Can be a photo of the goods or a marketing image for a service. |
| photo_size | `number` | No | Photo size in bytes |
| photo_width | `number` | No | Photo width |
| photo_height | `number` | No | Photo height |
| need_name | `boolean` | No | Pass True if you require the user&#39;s full name to complete the order Ignored for payments in Telegram Stars. |
| need_phone_number | `boolean` | No | Pass True if you require the user&#39;s phone number to complete the order Ignored for payments in Telegram Stars. |
| need_email | `boolean` | No | Pass True if you require the user&#39;s email address to complete the order Ignored for payments in Telegram Stars. |
| need_shipping_address | `boolean` | No | Pass True if you require the user&#39;s shipping address to complete the order Ignored for payments in Telegram Stars. |
| send_phone_number_to_provider | `boolean` | No | Pass True if the user&#39;s phone number should be sent to the provider Ignored for payments in Telegram Stars. |
| send_email_to_provider | `boolean` | No | Pass True if the user&#39;s email address should be sent to the provider Ignored for payments in Telegram Stars. |
| is_flexible | `boolean` | No | Pass True if the final price depends on the shipping method Ignored for payments in Telegram Stars. |

## Return type

`string`
