# setStickerMaskPosition

Use this method to change the mask position of a mask sticker The sticker must belong to a sticker set that was created by the bot

[Telegram docs](https://core.telegram.org/bots/api#setstickermaskposition)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sticker | `string` | Yes | File identifier of the sticker |
| mask_position | [`MaskPosition`](../types/mask-position.md) | No | A JSON-serialized object with the position where the mask should be placed on faces Omit the parameter to remove the mask position. |

## Return type

`boolean`
