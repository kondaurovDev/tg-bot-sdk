# getMyCommands

Use this method to get the current list of the bot&#39;s commands for the given scope and user language If commands aren&#39;t set, an empty list is returned.

[Telegram docs](https://core.telegram.org/bots/api#getmycommands)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| scope | [`BotCommandScope`](../types/bot-command-scope.md) | No | A JSON-serialized object, describing scope of users Defaults to BotCommandScopeDefault. |
| language_code | `string` | No | A two-letter ISO 639-1 language code or an empty string |

## Return type

[`BotCommand`](../types/bot-command.md)[]
