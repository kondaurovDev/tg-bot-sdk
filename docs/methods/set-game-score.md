# setGameScore

Use this method to set the score of the specified user in a game message

[Telegram docs](https://core.telegram.org/bots/api#setgamescore)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | `number` | Yes | User identifier |
| score | `number` | Yes | New score, must be non-negative |
| force | `boolean` | No | Pass True if the high score is allowed to decrease This can be useful when fixing mistakes or banning cheaters |
| disable_edit_message | `boolean` | No | Pass True if the game message should not be automatically edited to include the current scoreboard |
| chat_id | `number` | No | Required if inline_message_id is not specified Unique identifier for the target chat |
| message_id | `number` | No | Required if inline_message_id is not specified Identifier of the sent message |
| inline_message_id | `string` | No | Required if chat_id and message_id are not specified Identifier of the inline message |

## Return type

[`Message`](../types/message.md) \| `boolean`
