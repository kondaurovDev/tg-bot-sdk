# Game

This object represents a game Use BotFather to create and edit games, their short names will act as unique identifiers.

[Telegram docs](https://core.telegram.org/bots/api#game)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | `string` | Yes | Title of the game |
| description | `string` | Yes | Description of the game |
| photo | [`PhotoSize`](photo-size.md)[] | Yes | Photo that will be displayed in the game message in chats. |
| text | `string` | No | Brief description of the game or high scores included in the game message Can be automatically edited to include current high scores for the game when the bot calls setGameScore, or manually edited using editMessageText 0-4096 characters. |
| text_entities | [`MessageEntity`](message-entity.md)[] | No | Special entities that appear in text, such as usernames, URLs, bot commands, etc. |
| animation | [`Animation`](animation.md) | No | Animation that will be displayed in the game message in chats Upload via BotFather |
