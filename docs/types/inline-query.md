# InlineQuery

This object represents an incoming inline query When the user sends an empty query, your bot could return some default or trending results.

[Telegram docs](https://core.telegram.org/bots/api#inlinequery)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Unique identifier for this query |
| from | [`User`](user.md) | Yes | Sender |
| query | `string` | Yes | Text of the query (up to 256 characters) |
| offset | `string` | Yes | Offset of the results to be returned, can be controlled by the bot |
| chat_type | `string` | No | Type of the chat from which the inline query was sent Can be either “sender” for a private chat with the inline query sender, “private”, “group”, “supergroup”, or “channel” The chat type should be always known for requests sent from official clients and most third-party clients, unless the request was sent from a secret chat |
| location | [`Location`](location.md) | No | Sender location, only for bots that request user location |
