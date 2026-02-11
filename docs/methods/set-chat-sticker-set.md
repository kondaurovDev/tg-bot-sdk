# setChatStickerSet

Use this method to set a new group sticker set for a supergroup The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights Use the field can_set_sticker_set optionally returned in getChat requests to check if the bot can use this method

[Telegram docs](https://core.telegram.org/bots/api#setchatstickerset)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername) |
| sticker_set_name | `string` | Yes | Name of the sticker set to be set as the group sticker set |

## Return type

`boolean`
