import { createBot } from "@effect-ak/tg-bot"

// Files both ways: text becomes a downloadable document, and files you
// attach (📎 next to the message box) are inspected and echoed back.
export default createBot().onMessage(({ command, document, photo, text }) => [
  command("/start", ({ ctx }) =>
    ctx.reply("Send me any text — I'll return it as a file. Or attach a file with 📎.")
  ),
  document(({ payload, ctx }) => {
    const doc = payload.document!
    return [
      ctx.reply(
        `Got <b>${doc.file_name ?? "a file"}</b> (${doc.file_size ?? "?"} bytes) — sending it back:`,
        { parse_mode: "HTML" }
      ),
      // Re-sending by file_id — no re-upload needed
      ctx.call("send_document", { chat_id: payload.chat.id, document: doc.file_id })
    ]
  }),
  photo(({ payload, ctx }) =>
    ctx.reply(`Nice photo! (${payload.photo!.length} size variant(s) received)`)
  ),
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
