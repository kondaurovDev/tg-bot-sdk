import { makeTgBotClient } from "@effect-ak/tg-bot-client"
import { runBot } from "@effect-ak/tg-bot"
import { loadConfig } from "../config"

const config = await loadConfig()

const tgClient = makeTgBotClient({
  bot_token: config.token
})

runBot({
  bot_token: config.token,
  mode: "batch",
  poll: {
    log_level: "debug",
    batch_size: 100,
    on_error: "stop",
    poll_timeout: 60
  },
  on_batch: async (updates) => {
    console.log("got many updates!", updates.length)

    const messages = updates.map((_) => _.message).filter((_) => _ != null)

    const result = await tgClient.executeSafe("send_message", {
      chat_id: config.chatId,
      text: `I got ${messages.length} messages`
    })

    if (!result.ok) {
      console.error("Failed to send batch summary:", result.error)
    }

    return true
  }
})
