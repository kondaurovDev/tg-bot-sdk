# getGameHighScores

Use this method to get data for high score tables Will return the score of the specified user and several of their neighbors in a game 
This method will currently return scores for the target user, plus two of their closest neighbors on each side Will also return the top three users if the user and their neighbors are not among them Please note that this behavior is subject to change.


[Telegram docs](https://core.telegram.org/bots/api#getgamehighscores)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | `number` | Yes | Target user id |
| chat_id | `number` | No | Required if inline_message_id is not specified Unique identifier for the target chat |
| message_id | `number` | No | Required if inline_message_id is not specified Identifier of the sent message |
| inline_message_id | `string` | No | Required if chat_id and message_id are not specified Identifier of the inline message |

## Return type

[`GameHighScore`](../types/game-high-score.md)[]
