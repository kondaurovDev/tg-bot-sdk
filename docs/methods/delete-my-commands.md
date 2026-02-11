# deleteMyCommands

Use this method to delete the list of the bot&#39;s commands for the given scope and user language After deletion, higher level commands will be shown to affected users

[Telegram docs](https://core.telegram.org/bots/api#deletemycommands)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| scope | [`BotCommandScope`](../types/bot-command-scope.md) | No | A JSON-serialized object, describing scope of users for which the commands are relevant Defaults to BotCommandScopeDefault. |
| language_code | `string` | No | A two-letter ISO 639-1 language code If empty, commands will be applied to all users from the given scope, for whose language there are no dedicated commands |

## Return type

`boolean`
