---
"@effect-ak/tg-bot-emulator": patch
---

`chooseInlineResult` sends the result as Telegram does: its `parse_mode` or `entities` apply, the message has `via_bot`, and the result's inline keyboard comes with it. Before, the text went out raw, as if the user had typed it.
