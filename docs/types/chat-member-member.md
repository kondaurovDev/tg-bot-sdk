# ChatMemberMember

Represents a chat member that has no additional privileges or restrictions.

[Telegram docs](https://core.telegram.org/bots/api#chatmembermember)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | `"member"` | Yes | The member&#39;s status in the chat, always “member” |
| user | [`User`](user.md) | Yes | Information about the user |
| until_date | `number` | No | Date when the user&#39;s subscription will expire; Unix time |
