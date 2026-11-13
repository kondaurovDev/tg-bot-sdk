---
"@effect-ak/tg-bot-emulator": patch
---

`tapButton` finds buttons of rich messages: `callback_data` in a `buttons` block, including blocks nested in quotations, details, collages and list items. Before, only `reply_markup.inline_keyboard` was searched, so tapping a rich message's button threw.
