# addStickerToSet

Use this method to add a new sticker to a set created by the bot Emoji sticker sets can have up to 200 stickers Other sticker sets can have up to 120 stickers

[Telegram docs](https://core.telegram.org/bots/api#addstickertoset)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | `number` | Yes | User identifier of sticker set owner |
| name | `string` | Yes | Sticker set name |
| sticker | [`InputSticker`](../types/input-sticker.md) | Yes | A JSON-serialized object with information about the added sticker If exactly the same sticker had already been added to the set, then the set isn&#39;t changed. |

## Return type

`boolean`
