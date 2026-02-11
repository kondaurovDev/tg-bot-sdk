# setMyShortDescription

Use this method to change the bot&#39;s short description, which is shown on the bot&#39;s profile page and is sent together with the link when users share the bot

[Telegram docs](https://core.telegram.org/bots/api#setmyshortdescription)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| short_description | `string` | No | New short description for the bot; 0-120 characters Pass an empty string to remove the dedicated short description for the given language. |
| language_code | `string` | No | A two-letter ISO 639-1 language code If empty, the short description will be applied to all users for whose language there is no dedicated short description. |

## Return type

`boolean`
