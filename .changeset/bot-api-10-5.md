---
"@effect-ak/tg-bot-api": minor
"@effect-ak/tg-bot-emulator": patch
---

Regenerate types for Telegram Bot API 10.5 (Mini Apps unchanged at 10.1).

- Bot settings: `set_my_settings` changes inline mode (`supports_inline_queries`, `inline_query_placeholder`, `needs_inline_query_location`, `inline_feedback_share_denominator`), privacy mode, the ability to be added to groups, forum topic mode in private chats (`has_topics_enabled`, `allows_users_to_create_topics`, `has_topic_sidebar`), `can_communicate_with_bots` and `callback_query_mode`.
- Callback queries: with `callback_query_mode` set to `"auto"` or `"inline"`, a query from a button in the bot's own message can carry `inline_message_id` instead of `message`. The `CallbackQuery` type is unchanged; a handler that reads `message` should not assume it is there.
- `BotFullInfo`: the bot's own info, with the new `active_usernames`, `inline_query_placeholder`, `needs_inline_query_location` and `has_topic_sidebar`.
- General: `WriteAccessAllowed.inviter`, for users the bot's owner invited to the private chat with the bot.

Breaking, as upstream:

- `get_me` returns `BotFullInfo` instead of `User`. The fields that only `get_me` filled are removed from `User`: `can_join_groups`, `can_read_all_group_messages`, `supports_guest_queries`, `supports_inline_queries`, `can_connect_to_business`, `has_main_web_app`, `has_topics_enabled`, `allows_users_to_create_topics`, `can_manage_bots`, `supports_join_request_queries`. In `BotFullInfo` they are required. `BotFullInfo` has no `last_name` or `language_code`.
- `RichBlockExpandableBlockQuotation` and `InputRichBlockExpandableBlockQuotation` have `blocks` (an array of blocks) instead of `text`.

**`@effect-ak/tg-bot-emulator`** — `get_me` returns a `BotFullInfo` with the settings of a bot fresh from BotFather. `emulator.bot` stays a `User`.
