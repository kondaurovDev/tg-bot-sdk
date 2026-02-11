# Sticker

This object represents a sticker.

[Telegram docs](https://core.telegram.org/bots/api#sticker)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file_id | `string` | Yes | Identifier for this file, which can be used to download or reuse the file |
| file_unique_id | `string` | Yes | Unique identifier for this file, which is supposed to be the same over time and for different bots Can&#39;t be used to download or reuse the file. |
| type | `"regular" | "mask" | "custom_emoji"` | Yes | Type of the sticker, currently one of “regular”, “mask”, “custom_emoji” The type of the sticker is independent from its format, which is determined by the fields is_animated and is_video. |
| width | `number` | Yes | Sticker width |
| height | `number` | Yes | Sticker height |
| is_animated | `boolean` | Yes | True, if the sticker is animated |
| is_video | `boolean` | Yes | True, if the sticker is a video sticker |
| thumbnail | [`PhotoSize`](photo-size.md) | No | Sticker thumbnail in the .WEBP or .JPG format |
| emoji | `string` | No | Emoji associated with the sticker |
| set_name | `string` | No | Name of the sticker set to which the sticker belongs |
| premium_animation | [`File`](file.md) | No | For premium regular stickers, premium animation for the sticker |
| mask_position | [`MaskPosition`](mask-position.md) | No | For mask stickers, the position where the mask should be placed |
| custom_emoji_id | `string` | No | For custom emoji stickers, unique identifier of the custom emoji |
| needs_repainting | `boolean` | No | True, if the sticker must be repainted to a text color in messages, the color of the Telegram Premium badge in emoji status, white color on chat photos, or another appropriate color in other places |
| file_size | `number` | No | File size in bytes |
