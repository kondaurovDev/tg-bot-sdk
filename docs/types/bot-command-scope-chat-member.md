# BotCommandScopeChatMember

Represents the scope of bot commands, covering a specific member of a group or supergroup chat.

[Telegram docs](https://core.telegram.org/bots/api#botcommandscopechatmember)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"chat_member"` | Yes | Scope type, must be chat_member |
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername) Channel direct messages chats and channel chats aren&#39;t supported. |
| user_id | `number` | Yes | Unique identifier of the target user |
