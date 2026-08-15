import { createBot } from "@effect-ak/tg-bot"

export const description = "Handles /help and /echo (dumps the raw message as JSON)"

export default createBot().onMessage(({ command, text, fallback }) => [
  command("/help", ({ ctx }) =>
    ctx.reply("Available commands:\n/help — this message\n/echo — your message as JSON")
  ),
  command("/echo", ({ payload, ctx }) =>
    ctx.reply(`<pre language="json">${JSON.stringify(payload, null, 2)}</pre>`, {
      parse_mode: "HTML"
    })
  ),
  text(({ ctx }) => ctx.reply("Unknown command. Try /help")),
  fallback(({ ctx }) => ctx.reply("Try /help"))
])
