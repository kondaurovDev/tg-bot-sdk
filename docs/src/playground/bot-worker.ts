import type { Bot, BotInstance } from "@effect-ak/tg-bot"
import type { Update } from "@effect-ak/tg-bot-api"

// esm.sh URL is only used at runtime for user-compiled code imports
const ESM_BOT_URL = "https://esm.sh/@effect-ak/tg-bot@1.3.0"

interface RunBotCommand {
  command: "run-bot"
  token: string
  code: string
  logLevel?: "info" | "debug"
}

let messageId = 0
let botInstance: BotInstance | null = null

function sendEvent(data: Record<string, unknown>) {
  self.postMessage({
    type: "from-worker",
    data,
    message_id: messageId++
  })
}

function formatData(data: unknown): string {
  if (data === undefined) return ""
  if (typeof data === "string") return data
  return JSON.stringify(data, null, 2) ?? String(data)
}

const workerLogger = {
  debug: (msg: string, data?: unknown) =>
    sendEvent({
      type: "log",
      level: "debug",
      text: data !== undefined ? `${msg} ${formatData(data)}` : msg
    }),
  info: (msg: string, data?: unknown) =>
    sendEvent({
      type: "log",
      level: "info",
      text: data !== undefined ? `${msg} ${formatData(data)}` : msg
    }),
  warn: (msg: string, data?: unknown) =>
    sendEvent({
      type: "log",
      level: "warn",
      text: data !== undefined ? `${msg} ${formatData(data)}` : msg
    }),
  error: (msg: string, data?: unknown) =>
    sendEvent({
      type: "log",
      level: "error",
      text: data !== undefined ? `${msg} ${formatData(data)}` : msg
    })
}

function replaceImports(code: string) {
  return code.replaceAll("@effect-ak/tg-bot", ESM_BOT_URL)
}

async function loadBot(code: string): Promise<Bot | null> {
  const preparedCode = replaceImports(code)
  const blob = new Blob([preparedCode], { type: "application/javascript" })
  const url = URL.createObjectURL(blob)
  try {
    const mod = await import(/* @vite-ignore */ url)
    return mod.default ?? null
  } catch (error) {
    sendEvent({
      type: "log",
      level: "error",
      text: `Can't load bot: ${error instanceof Error ? error.message : error}`
    })
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function runBot(command: RunBotCommand) {
  const bot = await loadBot(command.code)
  if (!bot || typeof bot.run !== "function") {
    sendEvent({ error: "Bot module must export default createBot()" })
    return
  }

  if (botInstance) {
    botInstance.stop()
    botInstance = null
  }

  botInstance = await bot.run({
    bot_token: command.token,
    poll: { on_error: "continue", log_level: command.logLevel ?? "info" },
    logger: workerLogger,
    onUpdate: (update: Update) => sendEvent({ type: "update", update }),
    onHandleResult: (result: {
      updateType: string
      status: string
      responseType?: string
      error?: string
      duration: number
    }) =>
      sendEvent({
        type: "handle-result",
        updateType: result.updateType,
        status: result.status,
        ...(result.responseType ? { responseType: result.responseType } : {}),
        ...(result.error ? { error: result.error } : {}),
        duration: result.duration
      })
  })

  sendEvent({
    success: "Bot started",
    newBotState: "active"
  })
}

self.onmessage = async (msg: MessageEvent) => {
  const data = msg.data
  if (data?.command === "run-bot" && data?.token && data?.code) {
    await runBot(data)
  } else {
    sendEvent({ error: "Unknown command" })
  }
}
