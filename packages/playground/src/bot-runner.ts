/**
 * @module bot-runner
 * The page's side of the bot worker. Every run starts a fresh worker (a
 * restart must cancel in-flight polling, or the Bot API answers 409) and
 * returns a new `EmulatorPort` over it: the chat sees a new chat per run.
 */
import type { ChatPortEvent, EmulatorPort } from "@effect-ak/tg-bot-emulator-react"

import type { PlaygroundMode, WorkerCommand, WorkerEvent } from "./protocol"

export interface RunOptions {
  mode: PlaygroundMode
  code: string
  token?: string
}

export interface BotRunner {
  /** Start the bot in a fresh worker; the port talks to this run only. */
  run(options: RunOptions): EmulatorPort
  stop(): void
  /** Every worker event of every run (logs, updates, results, errors). */
  onEvent(listener: (event: WorkerEvent) => void): () => void
}

// The chat's view of a worker event, if it has one
const toPortEvent = (event: WorkerEvent): ChatPortEvent | undefined => {
  switch (event.type) {
    case "chat-event":
      return event.event
    case "handle-result":
      return { type: "bot_idle" }
    case "action-error":
      return { type: "action_error", error: event.error }
    default:
      return undefined
  }
}

const createWorker = () =>
  new Worker(new URL("./bot-worker.ts", import.meta.url), { type: "module" })

export const createBotRunner = (): BotRunner => {
  const listeners = new Set<(event: WorkerEvent) => void>()
  let worker: Worker | undefined

  const stop = () => {
    worker?.terminate()
    worker = undefined
  }

  return {
    run({ mode, code, token }) {
      stop()
      const current = createWorker()
      worker = current
      const chatListeners = new Set<(event: ChatPortEvent) => void>()
      current.addEventListener("message", (msg: MessageEvent<WorkerEvent>) => {
        for (const listener of listeners) listener(msg.data)
        const portEvent = toPortEvent(msg.data)
        if (portEvent) for (const listener of chatListeners) listener(portEvent)
      })
      const send = (command: WorkerCommand) => current.postMessage(command)
      send({
        command: "run-bot",
        mode,
        code,
        logLevel: "debug",
        ...(token === undefined ? {} : { token })
      })

      return {
        subscribe(listener) {
          chatListeners.add(listener)
          return () => chatListeners.delete(listener)
        },
        sendMessage: (text, options = {}) => send({ command: "user-message", text, ...options }),
        sendFile: (file) => send({ command: "user-file", ...file }),
        tapButton: (data, message_id) => send({ command: "tap-button", data, message_id }),
        react: (message_id, emoji) => send({ command: "user-react", message_id, emoji }),
        deleteMessage: (message_id) => send({ command: "delete-message", message_id })
      }
    },
    stop,
    onEvent(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    }
  }
}
