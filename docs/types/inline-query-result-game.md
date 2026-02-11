# InlineQueryResultGame

Represents a Game.

[Telegram docs](https://core.telegram.org/bots/api#inlinequeryresultgame)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"game"` | Yes | Type of the result, must be game |
| id | `string` | Yes | Unique identifier for this result, 1-64 bytes |
| game_short_name | `string` | Yes | Short name of the game |
| reply_markup | [`InlineKeyboardMarkup`](inline-keyboard-markup.md) | No | Inline keyboard attached to the message |
