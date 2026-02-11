# getCustomEmojiStickers

Use this method to get information about custom emoji stickers by their identifiers

[Telegram docs](https://core.telegram.org/bots/api#getcustomemojistickers)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| custom_emoji_ids | `string[]` | Yes | A JSON-serialized list of custom emoji identifiers At most 200 custom emoji identifiers can be specified. |

## Return type

[`Sticker`](../types/sticker.md)[]
