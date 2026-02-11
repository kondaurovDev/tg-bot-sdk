# sendInvoice

Use this method to send invoices

[Telegram docs](https://core.telegram.org/bots/api#sendinvoice)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| title | `string` | Yes | Product name, 1-32 characters |
| description | `string` | Yes | Product description, 1-255 characters |
| payload | `string` | Yes | Bot-defined invoice payload, 1-128 bytes This will not be displayed to the user, use it for your internal processes. |
| currency | `string` | Yes | Three-letter ISO 4217 currency code, see more on currencies Pass “XTR” for payments in Telegram Stars. |
| prices | [`LabeledPrice`](../types/labeled-price.md)[] | Yes | Price breakdown, a JSON-serialized list of components (e.g product price, tax, discount, delivery cost, delivery tax, bonus, etc.) Must contain exactly one item for payments in Telegram Stars. |
| message_thread_id | `number` | No | Unique identifier for the target message thread (topic) of the forum; for forum supergroups only |
| direct_messages_topic_id | `number` | No | Identifier of the direct messages topic to which the message will be sent; required if the message is sent to a direct messages chat |
| provider_token | `string` | No | Payment provider token, obtained via @BotFather Pass an empty string for payments in Telegram Stars. |
| max_tip_amount | `number` | No | The maximum accepted amount for tips in the smallest units of the currency (integer, not float/double) For example, for a maximum tip of US$ 1.45 pass max_tip_amount = 145 See the exp parameter in currencies.json, it shows the number of digits past the decimal point for each currency (2 for the majority of currencies) Defaults to 0 Not supported for payments in Telegram Stars. |
| suggested_tip_amounts | `number[]` | No | A JSON-serialized array of suggested amounts of tips in the smallest units of the currency (integer, not float/double) At most 4 suggested tip amounts can be specified The suggested tip amounts must be positive, passed in a strictly increased order and must not exceed max_tip_amount. |
| start_parameter | `string` | No | Unique deep-linking parameter If left empty, forwarded copies of the sent message will have a Pay button, allowing multiple users to pay directly from the forwarded message, using the same invoice If non-empty, forwarded copies of the sent message will have a URL button with a deep link to the bot (instead of a Pay button), with the value used as the start parameter |
| provider_data | `string` | No | JSON-serialized data about the invoice, which will be shared with the payment provider A detailed description of required fields should be provided by the payment provider. |
| photo_url | `string` | No | URL of the product photo for the invoice Can be a photo of the goods or a marketing image for a service People like it better when they see what they are paying for. |
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
| disable_notification | `boolean` | No | Sends the message silently Users will receive a notification with no sound. |
| protect_content | `boolean` | No | Protects the contents of the sent message from forwarding and saving |
| allow_paid_broadcast | `boolean` | No | Pass True to allow up to 1000 messages per second, ignoring broadcasting limits for a fee of 0.1 Telegram Stars per message The relevant Stars will be withdrawn from the bot&#39;s balance |
| message_effect_id | `string` | No | Unique identifier of the message effect to be added to the message; for private chats only |
| suggested_post_parameters | [`SuggestedPostParameters`](../types/suggested-post-parameters.md) | No | A JSON-serialized object containing the parameters of the suggested post to send; for direct messages chats only If the message is sent as a reply to another suggested post, then that suggested post is automatically declined. |
| reply_parameters | [`ReplyParameters`](../types/reply-parameters.md) | No | Description of the message to reply to |
| reply_markup | [`InlineKeyboardMarkup`](../types/inline-keyboard-markup.md) | No | A JSON-serialized object for an inline keyboard If empty, one &#39;Pay total price&#39; button will be shown If not empty, the first button must be a Pay button. |

## Return type

[`Message`](../types/message.md)
