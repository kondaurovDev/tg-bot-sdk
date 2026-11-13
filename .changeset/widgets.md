---
"@effect-ak/tg-bot": minor
"@effect-ak/tg-bot-emulator": minor
---

HTML widgets (Bot API 10.4).

**`@effect-ak/tg-bot`**

- `bot.onWidgetQuery(...)` and `bot.onSharedWidgetQuery(...)`, with a `data(pattern, handler)` helper like `onCallbackQuery`'s.
- `ctx.answerWidgetQuery(data?)` answers the request; `ctx.editWidgetData({ chat_data, public_data })` changes the state of the widget the request came from.
- A widget handler that responds without answering gets an empty `answer_widget_query` sent for it — as callback queries already do — so the widget does not end in `TIMEOUT`.
- New export `resolveWidgetQueryId`.

**`@effect-ak/tg-bot-emulator`**

- `send_widget`, `send_shared_widget`, `answer_widget_query`, `edit_message_widget_data` and `edit_shared_widget_data`, with the documented size limits. Widget messages are protected content, as in production: `copy_message` and `forward_message` refuse them. A shared widget's public data changes in every message that shows it.
- `emulator.widgetRequest(message_id, data, { timeout })` plays the widget's `TelegramWidget.request()`: it delivers a `widget_query` and resolves with the bot's answer, or with `NOT_ALLOWED`, `BUSY`, `TIMEOUT` or `INVALID_ANSWER`.
- New events `widget_answered` and `widget_data_changed`.
