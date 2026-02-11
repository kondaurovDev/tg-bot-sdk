import { runTgChatBot } from "@effect-ak/tg-bot"
import { MESSAGE_EFFECTS } from "@effect-ak/tg-bot-client"

import { loadConfig } from "../config"
const config = await loadConfig()

runTgChatBot({
  bot_token: config.token,
  mode: "single",
  poll: {
    log_level: "debug",
    batch_size: 20,
    on_error: "continue"
  },
  on_message: [
    {
      match: ({ ctx }) => ctx.command === "/echo",
      handle: ({ update, ctx }) =>
        ctx.reply(
          `<pre language="json">${JSON.stringify(update, undefined, 2)}</pre>`,
          { parse_mode: "HTML" }
        )
    },
    {
      match: ({ ctx }) => ctx.command === "/bye",
      handle: ({ ctx }) =>
        ctx.reply("See you later!", {
          message_effect_id: MESSAGE_EFFECTS["❤️"]
        })
    },
    {
      match: ({ ctx }) => ctx.command === "/error",
      handle: () => {
        throw new Error("boom")
      }
    },
    {
      match: ({ update }) => update.text?.includes("+") ?? false,
      handle: ({ update, ctx }) => {
        const result = update.text!.split("+").reduce((sum, n) => sum + parseInt(n), 0)
        return ctx.replyWithDocument(
          {
            file_content: new TextEncoder().encode(`your sum is ${result}`),
            file_name: "hello.txt"
          },
          { caption: "sum result" }
        )
      }
    },
    {
      match: ({ update }) => !!update.text,
      handle: ({ ctx }) => ctx.reply("hey :)")
    }
  ]
})
