# close

Use this method to close the bot instance before moving it from one local server to another You need to delete the webhook before calling this method to ensure that the bot isn&#39;t launched again after server restart The method will return error 429 in the first 10 minutes after the bot is launched Requires no parameters.

[Telegram docs](https://core.telegram.org/bots/api#close)

## Return type

`boolean`
