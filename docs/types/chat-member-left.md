# ChatMemberLeft

Represents a chat member that isn&#39;t currently a member of the chat, but may join it themselves.

[Telegram docs](https://core.telegram.org/bots/api#chatmemberleft)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | `"left"` | Yes | The member&#39;s status in the chat, always “left” |
| user | [`User`](user.md) | Yes | Information about the user |
