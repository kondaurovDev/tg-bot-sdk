# PollOption

This object contains information about one answer option in a poll.

[Telegram docs](https://core.telegram.org/bots/api#polloption)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | `string` | Yes | Option text, 1-100 characters |
| voter_count | `number` | Yes | Number of users that voted for this option |
| text_entities | [`MessageEntity`](message-entity.md)[] | No | Special entities that appear in the option text Currently, only custom emoji entities are allowed in poll option texts |
