# Gift

This object represents a gift that can be sent by the bot.

[Telegram docs](https://core.telegram.org/bots/api#gift)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Unique identifier of the gift |
| sticker | [`Sticker`](sticker.md) | Yes | The sticker that represents the gift |
| star_count | `number` | Yes | The number of Telegram Stars that must be paid to send the sticker |
| upgrade_star_count | `number` | No | The number of Telegram Stars that must be paid to upgrade the gift to a unique one |
| total_count | `number` | No | The total number of the gifts of this type that can be sent; for limited gifts only |
| remaining_count | `number` | No | The number of remaining gifts of this type that can be sent; for limited gifts only |
| publisher_chat | [`Chat`](chat.md) | No | Information about the chat that published the gift |
