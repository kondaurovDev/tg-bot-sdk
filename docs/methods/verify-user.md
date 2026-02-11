# verifyUser

Verifies a user on behalf of the organization which is represented by the bot

[Telegram docs](https://core.telegram.org/bots/api#verifyuser)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | `number` | Yes | Unique identifier of the target user |
| custom_description | `string` | No | Custom description for the verification; 0-70 characters Must be empty if the organization isn&#39;t allowed to provide a custom verification description. |

## Return type

`boolean`
