# StickerSet

This object represents a sticker set.

[Telegram docs](https://core.telegram.org/bots/api#stickerset)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | `string` | Yes | Sticker set name |
| title | `string` | Yes | Sticker set title |
| sticker_type | `"regular" | "mask" | "custom_emoji"` | Yes | Type of stickers in the set, currently one of “regular”, “mask”, “custom_emoji” |
| stickers | [`Sticker`](sticker.md)[] | Yes | List of all set stickers |
| thumbnail | [`PhotoSize`](photo-size.md) | No | Sticker set thumbnail in the .WEBP, .TGS, or .WEBM format |
