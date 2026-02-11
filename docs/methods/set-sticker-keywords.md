# setStickerKeywords

Use this method to change search keywords assigned to a regular or custom emoji sticker The sticker must belong to a sticker set created by the bot

[Telegram docs](https://core.telegram.org/bots/api#setstickerkeywords)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sticker | `string` | Yes | File identifier of the sticker |
| keywords | `string[]` | No | A JSON-serialized list of 0-20 search keywords for the sticker with total length of up to 64 characters |

## Return type

`boolean`
