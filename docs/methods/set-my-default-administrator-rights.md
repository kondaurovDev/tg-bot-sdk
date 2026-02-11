# setMyDefaultAdministratorRights

Use this method to change the default administrator rights requested by the bot when it&#39;s added as an administrator to groups or channels These rights will be suggested to users, but they are free to modify the list before adding the bot

[Telegram docs](https://core.telegram.org/bots/api#setmydefaultadministratorrights)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| rights | [`ChatAdministratorRights`](../types/chat-administrator-rights.md) | No | A JSON-serialized object describing new default administrator rights If not specified, the default administrator rights will be cleared. |
| for_channels | `boolean` | No | Pass True to change the default administrator rights of the bot in channels Otherwise, the default administrator rights of the bot for groups and supergroups will be changed. |

## Return type

`boolean`
