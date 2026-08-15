---
"@effect-ak/tg-bot": minor
---

- `createWebhook` / `.webhook()` accept `secret_token` and reject requests whose `X-Telegram-Bot-Api-Secret-Token` header is missing or different with `403`; a warning is logged when it is omitted. `handler.setWebhook(params)` registers the webhook with the same secret.
- Handlers can respond with any Bot API method, not only `send_*`: new `ctx.answerCallbackQuery`, `ctx.editMessageText`, `ctx.editMessageReplyMarkup`, `ctx.deleteMessage`, `ctx.call(method, params)`, plus `BotResponse.call`, `BotResponse.all` and `.and()` for several calls per update.
- `callback_query` handlers that respond without an explicit `answer_callback_query` get one sent automatically, so inline buttons never hang.
- New `defineScreens(screens, options)` — declarative inline-keyboard navigation (screens as data, type-checked `next`, Back via parent or per-chat stack, `url`/`action` buttons, dynamic text, `onEnter` hook) installed via the new `bot.use(plugin)`.
- `ctx.reply*` from a `callback_query` handler now sends to the chat of the tapped message (previously it was silently dropped).
- Shortcuts `bot.command(cmd, handler)`, `bot.onText(handler)`, `bot.onCallback(pattern, handler)`; `.onXxx()` also accepts a single `{ match?, handle }` object.
- Handlers may return an array of `BotResponse`s — executed in order, same as `BotResponse.all`.
- Commands are matched case-insensitively and with the `@bot_name` suffix stripped, so `command("/start")` works in groups; `command("start")` without the slash is accepted too.
- **Breaking:** the handler input field `update` was renamed to `payload` (`({ payload, ctx }) => …`) — it holds the typed `Message` / `CallbackQuery` / …, never the `Update` envelope, and the old name was misleading. Rename in place; nothing else changes.
