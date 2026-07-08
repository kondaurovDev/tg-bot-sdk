import { makeTgBotClient } from "@effect-ak/tg-bot-client"
import { loadConfig } from "./config"

async function main() {
  const config = loadConfig()

  const client = makeTgBotClient({
    bot_token: config.token
  })

  // Set webhook (execute throws TgBotClientError on failure)
  const result = await client.execute("set_webhook", {
    url: config.webhookUrl,
    drop_pending_updates: true,
    allowed_updates: ["callback_query", "poll", "message"]
  })
  console.log("Webhook set:", result)

  // Verify
  const info = await client.execute("get_webhook_info", {})
  console.log("Webhook info:", info)
}

main().catch(console.error)
