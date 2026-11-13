/**
 * @module bot-worker
 * The Web Worker that runs the visitor's compiled bot. The SDK is bundled
 * from the workspace and handed to the bot module through
 * `globalThis.__TG_BOT_SDK__`, so the playground runs the repository's SDK,
 * with no CDN. In `virtual` mode the bot talks to an in-memory emulator and
 * the worker forwards its chat events; in `real` mode, to the Bot API.
 */
import * as botSdk from "@effect-ak/tg-bot"
import type { Bot, BotInstance } from "@effect-ak/tg-bot"
import * as apiSdk from "@effect-ak/tg-bot-api"
import * as clientSdk from "@effect-ak/tg-bot-client"
import { makeTgBotEmulator, type TgBotEmulator } from "@effect-ak/tg-bot-emulator"

import type { LogLevel, WorkerCommand, WorkerEvent } from "./protocol"
import { rewriteSdkImports, SDK_GLOBAL } from "./sdk-imports"

const sdkModules: Record<string, unknown> = {
  "@effect-ak/tg-bot": botSdk,
  "@effect-ak/tg-bot-api": apiSdk,
  "@effect-ak/tg-bot-client": clientSdk
}
Reflect.set(globalThis, SDK_GLOBAL, sdkModules)

let botInstance: BotInstance | null = null
let emulator: TgBotEmulator | null = null

const sendEvent = (event: WorkerEvent) => postMessage(event)

const formatData = (data: unknown): string => {
  if (data === undefined) return ""
  if (typeof data === "string") return data
  return JSON.stringify(data, null, 2) ?? String(data)
}

const log = (level: LogLevel, msg: string, data?: unknown) =>
  sendEvent({ type: "log", level, text: data === undefined ? msg : `${msg} ${formatData(data)}` })

const logger = {
  debug: (msg: string, data?: unknown) => log("debug", msg, data),
  info: (msg: string, data?: unknown) => log("info", msg, data),
  warn: (msg: string, data?: unknown) => log("warn", msg, data),
  error: (msg: string, data?: unknown) => log("error", msg, data)
}

const isBot = (value: unknown): value is Bot =>
  typeof value === "object" && value !== null && "run" in value && typeof value.run === "function"

const loadBot = async (code: string): Promise<Bot | null> => {
  const source = rewriteSdkImports(code, new Set(Object.keys(sdkModules)))
  const url = URL.createObjectURL(new Blob([source], { type: "application/javascript" }))
  try {
    const mod: unknown = await import(/* @vite-ignore */ url)
    const exported =
      typeof mod === "object" && mod !== null && "default" in mod ? mod.default : null
    return isBot(exported) ? exported : null
  } catch (error) {
    log("error", `Can't load bot: ${error instanceof Error ? error.message : String(error)}`)
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

const runBot = async (command: Extract<WorkerCommand, { command: "run-bot" }>) => {
  const bot = await loadBot(command.code)
  if (!bot) {
    sendEvent({ type: "error", error: "Bot module must export default createBot()" })
    return
  }

  botInstance?.stop()
  botInstance = null
  emulator = null

  let source: { client: TgBotEmulator["client"] } | { bot_token: string }
  if (command.mode === "virtual") {
    const created = makeTgBotEmulator()
    created.subscribe((event) => sendEvent({ type: "chat-event", event }))
    emulator = created
    source = { client: created.client }
  } else if (command.token) {
    source = { bot_token: command.token }
  } else {
    sendEvent({ type: "error", error: "Bot token is required in real mode" })
    return
  }

  botInstance = await bot.run({
    ...source,
    poll: { on_error: "continue", log_level: command.logLevel ?? "info" },
    logger,
    onUpdate: (update) => sendEvent({ type: "update", update }),
    onHandleResult: (result) =>
      sendEvent({
        type: "handle-result",
        updateType: result.updateType,
        status: result.status,
        ...(result.responseType ? { responseType: result.responseType } : {}),
        ...(result.error ? { error: result.error } : {}),
        duration: result.duration
      })
  })

  sendEvent({ type: "bot-state", state: "active", notice: "Bot started" })
}

// What the user does in the chat. A failure here (no such button, a message
// already gone) is the action's, not the bot's: reported as `action-error`,
// the bot keeps running.
const userAction = (work: (emulator: TgBotEmulator) => void) => {
  if (!emulator) {
    sendEvent({ type: "action-error", error: "Emulator is not running" })
    return
  }
  try {
    work(emulator)
  } catch (error) {
    sendEvent({
      type: "action-error",
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

addEventListener("message", (msg: MessageEvent<WorkerCommand>) => {
  const data = msg.data
  switch (data.command) {
    case "run-bot":
      void runBot(data)
      break
    case "user-message":
      userAction((e) =>
        e.sendMessage(data.text, data.reply_to === undefined ? {} : { reply_to: data.reply_to })
      )
      break
    case "delete-message":
      userAction((e) => e.deleteMessage(data.message_id))
      break
    case "tap-button":
      userAction((e) => e.tapButton(data.data, { message_id: data.message_id }))
      break
    case "user-file":
      userAction((e) => {
        const file = { file_content: data.bytes, file_name: data.file_name }
        const options = data.caption ? { caption: data.caption } : {}
        if (data.kind === "photo") e.sendPhoto(file, options)
        else e.sendDocument(file, options)
      })
      break
    case "user-react":
      userAction((e) => e.react(data.message_id, data.emoji))
      break
  }
})
