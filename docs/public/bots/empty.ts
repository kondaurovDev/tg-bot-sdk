import { createBot } from "@effect-ak/tg-bot"

export default createBot().onMessage(({ fallback }) => [
  fallback(({ payload, ctx }) => {
    if (payload.text) {
      return ctx.reply("hey!")
    }
    return ctx.ignore
  })
])
