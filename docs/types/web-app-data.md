# WebAppData

Describes data sent from a Web App to the bot.

[Telegram docs](https://core.telegram.org/bots/api#webappdata)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| data | `string` | Yes | The data Be aware that a bad client can send arbitrary data in this field. |
| button_text | `string` | Yes | Text of the web_app keyboard button from which the Web App was opened Be aware that a bad client can send arbitrary data in this field. |
