import { runBot } from "@effect-ak/tg-bot"

import { loadConfig } from "../config"

const config = await loadConfig()

const bot = await runBot({
  bot_token: config.token,
  mode: "single",
  on_message: [
    {
      match: ({ payload }) => !!payload.text,
      handle: ({ ctx }) => ctx.reply("hey :)")
    }
  ]
})

setTimeout(() => {
  console.log("time to reload")
  bot.reload({
    type: "single",
    on_message: [
      {
        match: ({ payload }) => !!payload.text,
        handle: ({ ctx }) => ctx.reply("reloaded hey :)")
      }
    ]
  })
}, 5000)
