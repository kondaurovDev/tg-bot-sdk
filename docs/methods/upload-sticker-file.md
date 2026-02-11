# uploadStickerFile

Use this method to upload a file with a sticker for later use in the createNewStickerSet, addStickerToSet, or replaceStickerInSet methods (the file can be used multiple times)

[Telegram docs](https://core.telegram.org/bots/api#uploadstickerfile)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | `number` | Yes | User identifier of sticker file owner |
| sticker | [`InputFile`](../types/input-file.md) | Yes | A file with the sticker in .WEBP, .PNG, .TGS, or .WEBM format See https://core.telegram.org/stickers for technical requirements More information on Sending Files » |
| sticker_format | `"static" | "animated" | "video"` | Yes | Format of the sticker, must be one of “static”, “animated”, “video” |

## Return type

[`File`](../types/file.md)
