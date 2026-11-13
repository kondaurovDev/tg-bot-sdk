---
"@effect-ak/tg-bot-emulator": minor
---

Bot profile methods: `get_my_name` / `set_my_name`, `get_my_description` / `set_my_description`, `get_my_short_description` / `set_my_short_description`, `get_my_commands` / `set_my_commands`. Also `set_my_profile_photo` / `remove_my_profile_photo` (the upload round-trips through `get_file`) and `get_user_profile_photos` for the bot itself. The profile survives `reset()`; `language_code` and command `scope` are accepted and ignored.
