# setUserEmojiStatus

Changes the emoji status for a given user that previously allowed the bot to manage their emoji status via the Mini App method requestEmojiStatusAccess

[Telegram docs](https://core.telegram.org/bots/api#setuseremojistatus)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | `number` | Yes | Unique identifier of the target user |
| emoji_status_custom_emoji_id | `string` | No | Custom emoji identifier of the emoji status to set Pass an empty string to remove the status. |
| emoji_status_expiration_date | `number` | No | Expiration date of the emoji status, if any |

## Return type

`boolean`
