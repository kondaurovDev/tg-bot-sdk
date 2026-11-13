---
"@effect-ak/tg-bot-emulator": minor
---

What a client UI needs to show the chat as Telegram does:

- `set_my_commands` emits `commands_changed` with the new list (the Menu button).
- A reply keyboard is the chat's, not the message's, as in Telegram (`Message.reply_markup` is inline only): sending one emits `reply_keyboard` with it, `remove_keyboard` emits `reply_keyboard` with `null`, and `emulator.replyKeyboard` holds the current one. `reset()` clears it.
