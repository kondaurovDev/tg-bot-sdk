# replaceStickerInSet

Use this method to replace an existing sticker in a sticker set with a new one The method is equivalent to calling deleteStickerFromSet, then addStickerToSet, then setStickerPositionInSet

[Telegram docs](https://core.telegram.org/bots/api#replacestickerinset)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | `number` | Yes | User identifier of the sticker set owner |
| name | `string` | Yes | Sticker set name |
| old_sticker | `string` | Yes | File identifier of the replaced sticker |
| sticker | [`InputSticker`](../types/input-sticker.md) | Yes | A JSON-serialized object with information about the added sticker If exactly the same sticker had already been added to the set, then the set remains unchanged. |

## Return type

`boolean`
