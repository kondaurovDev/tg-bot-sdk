# getMyDefaultAdministratorRights

Use this method to get the current default administrator rights of the bot

[Telegram docs](https://core.telegram.org/bots/api#getmydefaultadministratorrights)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| for_channels | `boolean` | No | Pass True to get default administrator rights of the bot in channels Otherwise, default administrator rights of the bot for groups and supergroups will be returned. |

## Return type

[`ChatAdministratorRights`](../types/chat-administrator-rights.md)
