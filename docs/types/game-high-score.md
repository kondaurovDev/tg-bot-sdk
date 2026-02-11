# GameHighScore

This object represents one row of the high scores table for a game.

[Telegram docs](https://core.telegram.org/bots/api#gamehighscore)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| position | `number` | Yes | Position in high score table for the game |
| user | [`User`](user.md) | Yes | User |
| score | `number` | Yes | Score |
