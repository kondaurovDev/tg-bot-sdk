import { createBot } from "@effect-ak/tg-bot"

export const description = "Turns any text message into a .txt file"

export default createBot().onMessage(({ text, fallback }) => [
  text(({ payload, ctx }) =>
    ctx.replyWithDocument(
      {
        file_content: new TextEncoder().encode(payload.text!),
        file_name: "message.txt"
      },
      { caption: "Here's your text as a file" }
    )
  ),
  fallback(({ ctx }) => ctx.reply("Send me any text and I'll save it as a file"))
])
