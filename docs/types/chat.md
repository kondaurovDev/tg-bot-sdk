# Chat

This object represents a chat.

[Telegram docs](https://core.telegram.org/bots/api#chat)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `number` | Yes | Unique identifier for this chat This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this identifier. |
| type | `"private" | "group" | "supergroup" | "channel"` | Yes | Type of the chat, can be either “private”, “group”, “supergroup” or “channel” |
| title | `string` | No | Title, for supergroups, channels and group chats |
| username | `string` | No | Username, for private chats, supergroups and channels if available |
| first_name | `string` | No | First name of the other party in a private chat |
| last_name | `string` | No | Last name of the other party in a private chat |
| is_forum | `boolean` | No | True, if the supergroup chat is a forum (has topics enabled) |
| is_direct_messages | `boolean` | No | True, if the chat is the direct messages chat of a channel |
