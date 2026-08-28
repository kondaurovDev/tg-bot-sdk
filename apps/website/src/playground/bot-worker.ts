/**
 * Web Worker that runs the user's compiled bot code.
 *
 * The SDK is bundled from the workspace and exposed to the user's module
 * through `globalThis.__TG_BOT_SDK__` (imports in the compiled code are
 * rewritten to read from it), so the playground always runs the same SDK
 * version as the repository — no CDN involved.
 *
 * In `virtual` mode the bot talks to an in-memory emulator instead of the
 * real Bot API: no token needed, chat events are forwarded to the page.
 */
import * as botSdk from "@effect-ak/tg-bot"
import * as apiSdk from "@effect-ak/tg-bot-api"
import * as clientSdk from "@effect-ak/tg-bot-client"
import { makeTgBotEmulator, type TgBotEmulator } from "@effect-ak/tg-bot-emulator"
import type { Bot, BotInstance } from "@effect-ak/tg-bot"

import type { WorkerCommand, WorkerEvent } from "./protocol"

const sdkModules: Record<string, unknown> = {
  "@effect-ak/tg-bot": botSdk,
  "@effect-ak/tg-bot-api": apiSdk,
  "@effect-ak/tg-bot-client": clientSdk
}

;(globalThis as any).__TG_BOT_SDK__ = sdkModules

let botInstance: BotInstance | null = null
let emulator: TgBotEmulator | null = null

const sendEvent = (event: WorkerEvent) => self.postMessage(event)

function formatData(data: unknown): string {
  if (data === undefined) return ""
  if (typeof data === "string") return data
  return JSON.stringify(data, null, 2) ?? String(data)
}

const log = (level: "debug" | "info" | "warn" | "error", msg: string, data?: unknown) =>
  sendEvent({
    type: "log",
    level,
    text: data !== undefined ? `${msg} ${formatData(data)}` : msg
  })

const workerLogger = {
  debug: (msg: string, data?: unknown) => log("debug", msg, data),
  info: (msg: string, data?: unknown) => log("info", msg, data),
  warn: (msg: string, data?: unknown) => log("warn", msg, data),
  error: (msg: string, data?: unknown) => log("error", msg, data)
}

/**
 * Rewrite `import ... from "@effect-ak/..."` statements in the compiled
 * user code to read from `globalThis.__TG_BOT_SDK__`, so the blob module
 * needs no network and always matches the bundled SDK version.
 */
export function rewriteSdkImports(code: string): string {
  const importRe = /import\s*(?:(\*\s*as\s+\w+)|\{([^}]*)\}|(\w+))\s*from\s*["']([^"']+)["'];?/g
  return code.replace(importRe, (statement, namespace, named, defaultName, specifier) => {
    if (!(specifier in sdkModules)) return statement
    const source = `globalThis.__TG_BOT_SDK__[${JSON.stringify(specifier)}]`
    if (namespace) {
      const alias = namespace.replace(/\*\s*as\s+/, "")
      return `const ${alias} = ${source};`
    }
    if (named !== undefined) {
      const bindings = named.replaceAll(/\s+as\s+/g, ": ")
      return `const {${bindings}} = ${source};`
    }
    return `const ${defaultName} = ${source}.default ?? ${source};`
  })
}

async function loadBot(code: string): Promise<Bot | null> {
  const blob = new Blob([rewriteSdkImports(code)], { type: "application/javascript" })
  const url = URL.createObjectURL(blob)
  try {
    const mod = await import(/* @vite-ignore */ url)
    return mod.default ?? null
  } catch (error) {
    log("error", `Can't load bot: ${error instanceof Error ? error.message : error}`)
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function runBot(command: Extract<WorkerCommand, { command: "run-bot" }>) {
  const bot = await loadBot(command.code)
  if (!bot || typeof bot.run !== "function") {
    sendEvent({ type: "error", error: "Bot module must export default createBot()" })
    return
  }

  if (botInstance) {
    botInstance.stop()
    botInstance = null
  }
  emulator = null

  if (command.mode === "virtual") {
    emulator = makeTgBotEmulator()
    emulator.subscribe((event) => sendEvent({ type: "chat-event", event }))
  } else if (!command.token) {
    sendEvent({ type: "error", error: "Bot token is required in real mode" })
    return
  }

  botInstance = await bot.run({
    ...(emulator ? { client: emulator.client } : { bot_token: command.token! }),
    poll: { on_error: "continue", log_level: command.logLevel ?? "info" },
    logger: workerLogger,
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

self.onmessage = async (msg: MessageEvent<WorkerCommand>) => {
  const data = msg.data
  switch (data?.command) {
    case "run-bot":
      await runBot(data)
      break
    case "user-message":
      if (!emulator) {
        sendEvent({ type: "error", error: "Emulator is not running" })
        break
      }
      emulator.sendMessage(data.text)
      break
    case "tap-button":
      if (!emulator) {
        sendEvent({ type: "error", error: "Emulator is not running" })
        break
      }
      try {
        emulator.tapButton(data.data, { message_id: data.message_id })
      } catch (error) {
        sendEvent({ type: "error", error: error instanceof Error ? error.message : `${error}` })
      }
      break
    case "user-file": {
      if (!emulator) {
        sendEvent({ type: "error", error: "Emulator is not running" })
        break
      }
      const file = { file_content: new Uint8Array(data.bytes), file_name: data.file_name }
      const options = data.caption ? { caption: data.caption } : {}
      if (data.kind === "photo") emulator.sendPhoto(file, options)
      else emulator.sendDocument(file, options)
      break
    }
    case "user-react":
      if (!emulator) {
        sendEvent({ type: "error", error: "Emulator is not running" })
        break
      }
      try {
        emulator.react(data.message_id, data.emoji)
      } catch (error) {
        sendEvent({ type: "error", error: error instanceof Error ? error.message : `${error}` })
      }
      break
    default:
      sendEvent({ type: "error", error: "Unknown command" })
  }
}
