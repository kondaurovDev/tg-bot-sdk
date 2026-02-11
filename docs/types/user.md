# User

This object represents a Telegram user or bot.

[Telegram docs](https://core.telegram.org/bots/api#user)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `number` | Yes | Unique identifier for this user or bot This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it But it has at most 52 significant bits, so a 64-bit integer or double-precision float type are safe for storing this identifier. |
| is_bot | `boolean` | Yes | True, if this user is a bot |
| first_name | `string` | Yes | User&#39;s or bot&#39;s first name |
| last_name | `string` | No | User&#39;s or bot&#39;s last name |
| username | `string` | No | User&#39;s or bot&#39;s username |
| language_code | `string` | No | IETF language tag of the user&#39;s language |
| is_premium | `boolean` | No | True, if this user is a Telegram Premium user |
| added_to_attachment_menu | `boolean` | No | True, if this user added the bot to the attachment menu |
| can_join_groups | `boolean` | No | True, if the bot can be invited to groups Returned only in getMe. |
| can_read_all_group_messages | `boolean` | No | True, if privacy mode is disabled for the bot Returned only in getMe. |
| supports_inline_queries | `boolean` | No | True, if the bot supports inline queries Returned only in getMe. |
| can_connect_to_business | `boolean` | No | True, if the bot can be connected to a Telegram Business account to receive its messages Returned only in getMe. |
| has_main_web_app | `boolean` | No | True, if the bot has a main Web App Returned only in getMe. |
