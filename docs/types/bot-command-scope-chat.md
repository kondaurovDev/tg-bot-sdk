# BotCommandScopeChat

Represents the scope of bot commands, covering a specific chat.

[Telegram docs](https://core.telegram.org/bots/api#botcommandscopechat)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"chat"` | Yes | Scope type, must be chat |
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername) Channel direct messages chats and channel chats aren&#39;t supported. |
