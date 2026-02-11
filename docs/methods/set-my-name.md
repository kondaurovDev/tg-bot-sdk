# setMyName

Use this method to change the bot&#39;s name

[Telegram docs](https://core.telegram.org/bots/api#setmyname)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | `string` | No | New bot name; 0-64 characters Pass an empty string to remove the dedicated name for the given language. |
| language_code | `string` | No | A two-letter ISO 639-1 language code If empty, the name will be shown to all users for whose language there is no dedicated name. |

## Return type

`boolean`
