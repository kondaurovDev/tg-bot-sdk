import { createBot } from "@effect-ak/tg-bot"

// A handler can return SEVERAL actions — they run in order.
// This one first reacts to your message (👍), then echoes it back.
// React to the echo yourself: double-click the bot's bubble.
export default createBot()
  .command("/start", ({ ctx }) => ctx.reply("Send me any text — I'll 👍 it and echo it back."))
  .onText(({ payload, ctx }) => [
    ctx.call("set_message_reaction", {
      chat_id: payload.chat.id,
      message_id: payload.message_id,
      reaction: [{ type: "emoji", emoji: "👍" }]
    }),
    ctx.reply(`You said: ${payload.text}`)
  ])
  .on("message_reaction", ({ fallback }) => [
    fallback(({ payload, ctx }) => {
      const first = payload.new_reaction[0]
      if (!first || !("emoji" in first)) return ctx.ignore
      return ctx.reply(`Right back at you ${first.emoji}`)
    })
  ])
