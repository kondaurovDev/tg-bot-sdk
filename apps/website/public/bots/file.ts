import { createBot } from "@effect-ak/tg-bot"

export default createBot().onMessage(({ command, text }) => [
  command("/start", ({ ctx }) => ctx.reply("Send me any text and I'll save it as a file")),
  text(({ payload, ctx }) =>
    ctx.replyWithDocument(
      {
        file_content: new TextEncoder().encode(payload.text!),
        file_name: "message.txt"
      },
      { caption: "Here's your text as a file" }
    )
  )
])
