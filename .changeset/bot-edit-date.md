---
"@effect-ak/tg-bot-emulator": patch
---

The bot's edits (`edit_message_text`, `edit_message_caption`, `edit_message_reply_markup`) stamp `edit_date` on the message, as Telegram does; only the user's edits did.
