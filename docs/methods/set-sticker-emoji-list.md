# setStickerEmojiList

Use this method to change the list of emoji assigned to a regular or custom emoji sticker The sticker must belong to a sticker set created by the bot

[Telegram docs](https://core.telegram.org/bots/api#setstickeremojilist)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sticker | `string` | Yes | File identifier of the sticker |
| emoji_list | `string[]` | Yes | A JSON-serialized list of 1-20 emoji associated with the sticker |

## Return type

`boolean`
