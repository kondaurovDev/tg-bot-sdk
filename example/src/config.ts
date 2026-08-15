import { config } from "dotenv"

export const loadConfig = () => {
  const loadResult = config()
  console.log("load .env", loadResult)

  const token = process.env.TOKEN
  const chatId = process.env.CHAT_ID

  if (!token || token.trim() === "") {
    throw new Error("TOKEN environment variable is required and must be non-empty")
  }

  if (!chatId || chatId.trim() === "") {
    throw new Error("CHAT_ID environment variable is required and must be non-empty")
  }

  return {
    token,
    chatId
  }
}
