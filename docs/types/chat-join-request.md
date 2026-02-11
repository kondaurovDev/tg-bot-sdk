# ChatJoinRequest

Represents a join request sent to a chat.

[Telegram docs](https://core.telegram.org/bots/api#chatjoinrequest)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| chat | [`Chat`](chat.md) | Yes | Chat to which the request was sent |
| from | [`User`](user.md) | Yes | User that sent the join request |
| user_chat_id | `number` | Yes | Identifier of a private chat with the user who sent the join request This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it But it has at most 52 significant bits, so a 64-bit integer or double-precision float type are safe for storing this identifier The bot can use this identifier for 5 minutes to send messages until the join request is processed, assuming no other administrator contacted the user. |
| date | `number` | Yes | Date the request was sent in Unix time |
| bio | `string` | No | Bio of the user. |
| invite_link | [`ChatInviteLink`](chat-invite-link.md) | No | Chat invite link that was used by the user to send the join request |
