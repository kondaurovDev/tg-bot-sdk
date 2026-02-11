# setCustomEmojiStickerSetThumbnail

Use this method to set the thumbnail of a custom emoji sticker set

[Telegram docs](https://core.telegram.org/bots/api#setcustomemojistickersetthumbnail)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | `string` | Yes | Sticker set name |
| custom_emoji_id | `string` | No | Custom emoji identifier of a sticker from the sticker set; pass an empty string to drop the thumbnail and use the first sticker as the thumbnail. |

## Return type

`boolean`
