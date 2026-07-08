import { createBot } from "@effect-ak/tg-bot"

export default createBot().onMessage(({ fallback }) => [
  fallback(({ update, ctx }) => {
    if (update.text) {
      return ctx.reply("hey!")
    }
    return ctx.ignore
  })
])
