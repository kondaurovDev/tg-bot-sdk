# UniqueGiftSymbol

This object describes the symbol shown on the pattern of a unique gift.

[Telegram docs](https://core.telegram.org/bots/api#uniquegiftsymbol)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | `string` | Yes | Name of the symbol |
| sticker | [`Sticker`](sticker.md) | Yes | The sticker that represents the unique gift |
| rarity_per_mille | `number` | Yes | The number of unique gifts that receive this model for every 1000 gifts upgraded |
