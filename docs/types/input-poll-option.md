# InputPollOption

This object contains information about one answer option in a poll to be sent.

[Telegram docs](https://core.telegram.org/bots/api#inputpolloption)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | `string` | Yes | Option text, 1-100 characters |
| text_parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the text See formatting options for more details Currently, only custom emoji entities are allowed |
| text_entities | [`MessageEntity`](message-entity.md)[] | No | A JSON-serialized list of special entities that appear in the poll option text It can be specified instead of text_parse_mode |
