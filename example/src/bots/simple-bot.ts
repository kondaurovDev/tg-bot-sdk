import { runTgChatBot } from "@effect-ak/tg-bot"

import { loadConfig } from "../config"

const config = await loadConfig()

runTgChatBot({
  bot_token: config.token,
  mode: "single",
  on_message: [
    {
      match: ({ update }) => !!update.text,
      handle: ({ ctx }) => ctx.reply("hello!!!")
    }
  ]
})
