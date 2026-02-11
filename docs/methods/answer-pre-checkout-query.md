# answerPreCheckoutQuery

Once the user has confirmed their payment and shipping details, the Bot API sends the final confirmation in the form of an Update with the field pre_checkout_query Use this method to respond to such pre-checkout queries Note: The Bot API must receive an answer within 10 seconds after the pre-checkout query was sent.

[Telegram docs](https://core.telegram.org/bots/api#answerprecheckoutquery)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pre_checkout_query_id | `string` | Yes | Unique identifier for the query to be answered |
| ok | `boolean` | Yes | Specify True if everything is alright (goods are available, etc.) and the bot is ready to proceed with the order Use False if there are any problems. |
| error_message | `string` | No | Required if ok is False Error message in human readable form that explains the reason for failure to proceed with the checkout (e.g "Sorry, somebody just bought the last of our amazing black T-shirts while you were busy filling out your payment details Please choose a different color or garment!") Telegram will display this message to the user. |

## Return type

`boolean`
