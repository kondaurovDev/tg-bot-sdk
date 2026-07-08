import { createBot } from "@effect-ak/tg-bot"

export default createBot().onMessage(({ command, text }) => [
  command("/start", ({ ctx }) => ctx.reply("Send me any text and I'll echo it back!")),
  text(({ update, ctx }) => ctx.reply(`You said: ${update.text}`))
])
