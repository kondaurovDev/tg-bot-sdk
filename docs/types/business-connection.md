# BusinessConnection

Describes the connection of the bot with a business account.

[Telegram docs](https://core.telegram.org/bots/api#businessconnection)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Unique identifier of the business connection |
| user | [`User`](user.md) | Yes | Business account user that created the business connection |
| user_chat_id | `number` | Yes | Identifier of a private chat with the user who created the business connection This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it But it has at most 52 significant bits, so a 64-bit integer or double-precision float type are safe for storing this identifier. |
| date | `number` | Yes | Date the connection was established in Unix time |
| is_enabled | `boolean` | Yes | True, if the connection is active |
| rights | [`BusinessBotRights`](business-bot-rights.md) | No | Rights of the business bot |
