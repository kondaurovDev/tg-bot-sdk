# ChatMemberBanned

Represents a chat member that was banned in the chat and can&#39;t return to the chat or view chat messages.

[Telegram docs](https://core.telegram.org/bots/api#chatmemberbanned)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | `"kicked"` | Yes | The member&#39;s status in the chat, always “kicked” |
| user | [`User`](user.md) | Yes | Information about the user |
| until_date | `number` | Yes | Date when restrictions will be lifted for this user; Unix time If 0, then the user is banned forever |
