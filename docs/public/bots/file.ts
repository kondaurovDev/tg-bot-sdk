import { createBot } from "@effect-ak/tg-bot"

export default createBot().onMessage(({ command, text }) => [
  command("/start", ({ ctx }) => ctx.reply("Send me any text and I'll save it as a file")),
  text(({ update, ctx }) =>
    ctx.replyWithDocument(
      {
        file_content: new TextEncoder().encode(update.text!),
        file_name: "message.txt"
      },
      { caption: "Here's your text as a file" }
    )
  )
])
