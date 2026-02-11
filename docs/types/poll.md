# Poll

This object contains information about a poll.

[Telegram docs](https://core.telegram.org/bots/api#poll)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Unique poll identifier |
| question | `string` | Yes | Poll question, 1-300 characters |
| options | [`PollOption`](poll-option.md)[] | Yes | List of poll options |
| total_voter_count | `number` | Yes | Total number of users that voted in the poll |
| is_closed | `boolean` | Yes | True, if the poll is closed |
| is_anonymous | `boolean` | Yes | True, if the poll is anonymous |
| type | `"regular" | "quiz"` | Yes | Poll type, currently can be “regular” or “quiz” |
| allows_multiple_answers | `boolean` | Yes | True, if the poll allows multiple answers |
| question_entities | [`MessageEntity`](message-entity.md)[] | No | Special entities that appear in the question Currently, only custom emoji entities are allowed in poll questions |
| correct_option_id | `number` | No | 0-based identifier of the correct answer option Available only for polls in the quiz mode, which are closed, or was sent (not forwarded) by the bot or to the private chat with the bot. |
| explanation | `string` | No | Text that is shown when a user chooses an incorrect answer or taps on the lamp icon in a quiz-style poll, 0-200 characters |
| explanation_entities | [`MessageEntity`](message-entity.md)[] | No | Special entities like usernames, URLs, bot commands, etc that appear in the explanation |
| open_period | `number` | No | Amount of time in seconds the poll will be active after creation |
| close_date | `number` | No | Point in time (Unix timestamp) when the poll will be automatically closed |
