---
"@effect-ak/tg-bot": minor
---

`BotResponse.orElse(fallback)`: answer when Telegram refuses a call. If one of the response's calls fails, the rest of it is skipped and the fallback runs, given the client's error (`(error) => ctx.reply(...)`, or a plain response). Without it a failed call is only logged, as before. Calls inside `orElse` count for auto-answering, so a callback query answered there is not answered twice.
