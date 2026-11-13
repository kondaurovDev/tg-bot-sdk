import { createBot } from "@effect-ak/tg-bot"

// Guarded handlers run top to bottom — the first match wins,
// so the plain-text handler at the end is the fallback.
export default createBot().onMessage(({ command, text }) => [
  command("/start", ({ ctx }) => [
    // What Telegram lists under the Menu button next to the message field
    ctx.call("set_my_commands", {
      commands: [
        { command: "help", description: "What this bot can do" },
        { command: "echo", description: "Your message as JSON" },
        { command: "fruit", description: "Pick from a reply keyboard" }
      ]
    }),
    ctx.reply("Hello! Open the Menu, or try /help")
  ]),
  command("/help", ({ ctx }) =>
    ctx.reply(
      "Available commands:\n/help — this message\n/echo — your message as JSON\n/fruit — a reply keyboard"
    )
  ),
  // parse_mode: "HTML" works like in real Telegram: <pre> becomes a code block
  command("/echo", ({ payload, ctx }) =>
    ctx.reply(`<pre language="json">${JSON.stringify(payload, null, 2)}</pre>`, {
      parse_mode: "HTML"
    })
  ),
  // A reply keyboard replaces the phone's keyboard; a key sends its text
  command("/fruit", ({ ctx }) =>
    ctx.reply("Pick a fruit", {
      reply_markup: {
        keyboard: [[{ text: "🍎 Apple" }, { text: "🍌 Banana" }], [{ text: "Done" }]],
        resize_keyboard: true,
        input_field_placeholder: "Pick a fruit"
      }
    })
  ),
  text(({ payload, ctx }) =>
    payload.text === "Done"
      ? ctx.reply("Keyboard removed", { reply_markup: { remove_keyboard: true } })
      : ctx.reply(`You said: ${payload.text}. Try /help`)
  )
])
