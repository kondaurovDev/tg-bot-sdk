# answerCallbackQuery

Use this method to send answers to callback queries sent from inline keyboards The answer will be displayed to the user as a notification at the top of the chat screen or as an alert 
Alternatively, the user can be redirected to the specified Game URL For this option to work, you must first create a game for your bot via @BotFather and accept the terms Otherwise, you may use links like t.me/your_bot?start=XXXX that open your bot with a parameter.


[Telegram docs](https://core.telegram.org/bots/api#answercallbackquery)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| callback_query_id | `string` | Yes | Unique identifier for the query to be answered |
| text | `string` | No | Text of the notification If not specified, nothing will be shown to the user, 0-200 characters |
| show_alert | `boolean` | No | If True, an alert will be shown by the client instead of a notification at the top of the chat screen Defaults to false. |
| url | `string` | No | URL that will be opened by the user&#39;s client If you have created a Game and accepted the conditions via @BotFather, specify the URL that opens your game - note that this will only work if the query comes from a callback_game button . Otherwise, you may use links like t.me/your_bot?start=XXXX that open your bot with a parameter. |
| cache_time | `number` | No | The maximum amount of time in seconds that the result of the callback query may be cached client-side Telegram apps will support caching starting in version 3.14 Defaults to 0. |

## Return type

`boolean`
