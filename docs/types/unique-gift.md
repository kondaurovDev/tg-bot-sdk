# UniqueGift

This object describes a unique gift that was upgraded from a regular gift.

[Telegram docs](https://core.telegram.org/bots/api#uniquegift)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| base_name | `string` | Yes | Human-readable name of the regular gift from which this unique gift was upgraded |
| name | `string` | Yes | Unique name of the gift This name can be used in https://t.me/nft/... links and story areas |
| number | `number` | Yes | Unique number of the upgraded gift among gifts upgraded from the same regular gift |
| model | [`UniqueGiftModel`](unique-gift-model.md) | Yes | Model of the gift |
| symbol | [`UniqueGiftSymbol`](unique-gift-symbol.md) | Yes | Symbol of the gift |
| backdrop | [`UniqueGiftBackdrop`](unique-gift-backdrop.md) | Yes | Backdrop of the gift |
| publisher_chat | [`Chat`](chat.md) | No | Information about the chat that published the gift |
