# setChatMenuButton

Use this method to change the bot&#39;s menu button in a private chat, or the default menu button

[Telegram docs](https://core.telegram.org/bots/api#setchatmenubutton)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` | No | Unique identifier for the target private chat If not specified, default bot&#39;s menu button will be changed |
| menu_button | [`MenuButton`](../types/menu-button.md) | No | A JSON-serialized object for the bot&#39;s new menu button Defaults to MenuButtonDefault |

## Return type

`boolean`
