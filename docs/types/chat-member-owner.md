# ChatMemberOwner

Represents a chat member that owns the chat and has all administrator privileges.

[Telegram docs](https://core.telegram.org/bots/api#chatmemberowner)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | `"creator"` | Yes | The member&#39;s status in the chat, always “creator” |
| user | [`User`](user.md) | Yes | Information about the user |
| is_anonymous | `boolean` | Yes | True, if the user&#39;s presence in the chat is hidden |
| custom_title | `string` | No | Custom title for this user |
