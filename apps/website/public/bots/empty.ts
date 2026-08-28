import { createBot } from "@effect-ak/tg-bot"

// The smallest possible bot. Edit the reply and just wait a moment —
// the playground recompiles and restarts it automatically.
export default createBot()
  .command("/start", ({ ctx }) => ctx.reply("Hi! I'm alive — say anything."))
  .onText(({ payload, ctx }) => ctx.reply(`hey! you said: ${payload.text}`))
