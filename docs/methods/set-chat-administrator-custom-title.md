# setChatAdministratorCustomTitle

Use this method to set a custom title for an administrator in a supergroup promoted by the bot

[Telegram docs](https://core.telegram.org/bots/api#setchatadministratorcustomtitle)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername) |
| user_id | `number` | Yes | Unique identifier of the target user |
| custom_title | `string` | Yes | New custom title for the administrator; 0-16 characters, emoji are not allowed |

## Return type

`boolean`
