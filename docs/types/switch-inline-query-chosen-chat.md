# SwitchInlineQueryChosenChat

This object represents an inline button that switches the current user to inline mode in a chosen chat, with an optional default inline query.

[Telegram docs](https://core.telegram.org/bots/api#switchinlinequerychosenchat)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| query | `string` | No | The default inline query to be inserted in the input field If left empty, only the bot&#39;s username will be inserted |
| allow_user_chats | `boolean` | No | True, if private chats with users can be chosen |
| allow_bot_chats | `boolean` | No | True, if private chats with bots can be chosen |
| allow_group_chats | `boolean` | No | True, if group and supergroup chats can be chosen |
| allow_channel_chats | `boolean` | No | True, if channel chats can be chosen |
