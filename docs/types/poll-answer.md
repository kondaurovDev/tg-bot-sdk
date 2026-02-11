# PollAnswer

This object represents an answer of a user in a non-anonymous poll.

[Telegram docs](https://core.telegram.org/bots/api#pollanswer)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| poll_id | `string` | Yes | Unique poll identifier |
| option_ids | `number[]` | Yes | 0-based identifiers of chosen answer options May be empty if the vote was retracted. |
| voter_chat | [`Chat`](chat.md) | No | The chat that changed the answer to the poll, if the voter is anonymous |
| user | [`User`](user.md) | No | The user that changed the answer to the poll, if the voter isn&#39;t anonymous |
