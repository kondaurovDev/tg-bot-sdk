import { createBot } from "@effect-ak/tg-bot"

export const description = "Echoes back any text message"

export default createBot().onMessage(({ text, fallback }) => [
  text(({ payload, ctx }) => ctx.reply(payload.text!)),
  fallback(({ ctx }) => ctx.reply("Send me some text"))
])
