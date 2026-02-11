# createNewStickerSet

Use this method to create a new sticker set owned by a user The bot will be able to edit the sticker set thus created

[Telegram docs](https://core.telegram.org/bots/api#createnewstickerset)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | `number` | Yes | User identifier of created sticker set owner |
| name | `string` | Yes | Short name of sticker set, to be used in t.me/addstickers/ URLs (e.g., animals) Can contain only English letters, digits and underscores Must begin with a letter, can&#39;t contain consecutive underscores and must end in "_by_&lt;bot_username&gt;" &lt;bot_username&gt; is case insensitive 1-64 characters. |
| title | `string` | Yes | Sticker set title, 1-64 characters |
| stickers | [`InputSticker`](../types/input-sticker.md)[] | Yes | A JSON-serialized list of 1-50 initial stickers to be added to the sticker set |
| sticker_type | `string` | No | Type of stickers in the set, pass “regular”, “mask”, or “custom_emoji” By default, a regular sticker set is created. |
| needs_repainting | `boolean` | No | Pass True if stickers in the sticker set must be repainted to the color of text when used in messages, the accent color if used as emoji status, white on chat photos, or another appropriate color based on context; for custom emoji sticker sets only |

## Return type

`boolean`
