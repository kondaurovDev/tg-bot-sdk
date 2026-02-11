# SharedUser

This object contains information about a user that was shared with the bot using a KeyboardButtonRequestUsers button.

[Telegram docs](https://core.telegram.org/bots/api#shareduser)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | `number` | Yes | Identifier of the shared user This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it But it has at most 52 significant bits, so 64-bit integers or double-precision float types are safe for storing these identifiers The bot may not have access to the user and could be unable to use this identifier, unless the user is already known to the bot by some other means. |
| first_name | `string` | No | First name of the user, if the name was requested by the bot |
| last_name | `string` | No | Last name of the user, if the name was requested by the bot |
| username | `string` | No | Username of the user, if the username was requested by the bot |
| photo | [`PhotoSize`](photo-size.md)[] | No | Available sizes of the chat photo, if the photo was requested by the bot |
