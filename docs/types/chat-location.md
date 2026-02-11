# ChatLocation

Represents a location to which a chat is connected.

[Telegram docs](https://core.telegram.org/bots/api#chatlocation)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| location | [`Location`](location.md) | Yes | The location to which the supergroup is connected Can&#39;t be a live location. |
| address | `string` | Yes | Location address; 1-64 characters, as defined by the chat owner |
