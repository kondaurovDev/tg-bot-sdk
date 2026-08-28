/**
 * Typed messages exchanged between the playground page and the bot worker.
 */
import type { Update } from "@effect-ak/tg-bot-api"
import type { EmulatorEvent } from "@effect-ak/tg-bot-emulator"

export type PlaygroundMode = "virtual" | "real"

export type LogLevel = "debug" | "info" | "warn" | "error"

export type HandleStatus = "handled" | "ignored" | "no_handler" | "error"

// -- page → worker --

export type WorkerCommand =
  | {
      command: "run-bot"
      mode: PlaygroundMode
      code: string
      token?: string
      logLevel?: "info" | "debug"
    }
  | { command: "user-message"; text: string }
  | { command: "tap-button"; data: string; message_id: number }
  | {
      command: "user-file"
      file_name: string
      bytes: ArrayBuffer
      kind: "photo" | "document"
      caption?: string
    }
  | { command: "user-react"; message_id: number; emoji: string | null }

// -- worker → page --

export type WorkerEvent =
  | { type: "bot-state"; state: "active" | "stopped"; notice?: string }
  | { type: "log"; level: LogLevel; text: string }
  | { type: "update"; update: Update }
  | {
      type: "handle-result"
      updateType: string
      status: HandleStatus
      responseType?: string
      error?: string
      duration: number
    }
  | { type: "chat-event"; event: EmulatorEvent }
  | { type: "error"; error: string }
