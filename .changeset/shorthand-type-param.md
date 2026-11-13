---
"@effect-ak/tg-bot": patch
---

The `send_*` shorthand (`BotResponse.make({ type: "message", … })`, `ctx.reply`, …) no longer sends its `type` key to Telegram as a parameter. For `send_poll`, whose own `type` parameter is `"quiz" | "regular"`, that sent `type=poll` and failed the call. The poll's own `type` cannot be set through the shorthand; use `ctx.call("send_poll", { … })` for a quiz.
