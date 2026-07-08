import { makeTgBotClient, TgBotClientError } from "@effect-ak/tg-bot-client"
import { loadConfig } from "./config"

async function main() {
  const config = loadConfig()
  const chatId = config.chatId

  const client = makeTgBotClient({
    bot_token: config.token
  })

  try {
    await client.execute("send_message", {
      text: `hello, ${chatId}`,
      chat_id: chatId
    })
  } catch (error) {
    if (error instanceof TgBotClientError) {
      console.error("Error:", error.reason._tag, error.message)
    } else {
      console.error("Error:", error)
    }
    process.exit(1)
  }

  console.log("Message sent successfully!")
}

main()
