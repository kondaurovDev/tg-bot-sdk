# answerShippingQuery

If you sent an invoice requesting a shipping address and the parameter is_flexible was specified, the Bot API will send an Update with a shipping_query field to the bot Use this method to reply to shipping queries

[Telegram docs](https://core.telegram.org/bots/api#answershippingquery)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| shipping_query_id | `string` | Yes | Unique identifier for the query to be answered |
| ok | `boolean` | Yes | Pass True if delivery to the specified address is possible and False if there are any problems (for example, if delivery to the specified address is not possible) |
| shipping_options | [`ShippingOption`](../types/shipping-option.md)[] | No | Required if ok is True A JSON-serialized array of available shipping options. |
| error_message | `string` | No | Required if ok is False Error message in human readable form that explains why it is impossible to complete the order (e.g “Sorry, delivery to your desired address is unavailable”) Telegram will display this message to the user. |

## Return type

`boolean`
