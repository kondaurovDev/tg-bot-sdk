# BotCommandScopeChatAdministrators

Represents the scope of bot commands, covering all administrators of a specific group or supergroup chat.

[Telegram docs](https://core.telegram.org/bots/api#botcommandscopechatadministrators)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"chat_administrators"` | Yes | Scope type, must be chat_administrators |
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername) Channel direct messages chats and channel chats aren&#39;t supported. |
