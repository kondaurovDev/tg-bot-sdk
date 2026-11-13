import { createBot } from "@effect-ak/tg-bot"

// Guarded handlers run top to bottom — the first match wins,
// so the plain-text handler at the end is the fallback.
export default createBot().onMessage(({ command, text }) => [
  command("/start", ({ ctx }) => ctx.reply("Hello! Try /help or /echo")),
  command("/help", ({ ctx }) =>
    ctx.reply(
      "Available commands:\n/start — welcome message\n/help — this message\n/echo — your message as JSON"
    )
  ),
  // parse_mode: "HTML" works like in real Telegram: <pre> becomes a code block
  command("/echo", ({ payload, ctx }) =>
    ctx.reply(`<pre language="json">${JSON.stringify(payload, null, 2)}</pre>`, {
      parse_mode: "HTML"
    })
  ),
  text(({ ctx }) => ctx.reply("Unknown command. Try /help"))
])
