/**
 * @module protocol
 * The messages between the page and the bot worker.
 */
import type { Update } from "@effect-ak/tg-bot-api"
import type { EmulatorEvent, WidgetRequestOutcome } from "@effect-ak/tg-bot-emulator"

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
  | { command: "user-message"; text: string; reply_to?: number }
  | { command: "tap-button"; data: string; message_id: number }
  | { command: "delete-message"; message_id: number }
  | {
      command: "user-file"
      file_name: string
      bytes: Uint8Array<ArrayBuffer>
      kind: "photo" | "document"
      caption?: string
    }
  | { command: "user-react"; message_id: number; emoji: string | null }
  /** A file's bytes for the chat; answered by a `file` event with the same id. */
  | { command: "get-file"; request_id: number; file_id: string }
  /** A widget's request; answered by a `widget-answer` event with the same id. */
  | { command: "widget-request"; request_id: number; message_id: number; data: string }

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
  /** The bot could not start or load. */
  | { type: "error"; error: string }
  /** A user action in the chat failed; the bot keeps running. */
  | { type: "action-error"; error: string }
  | {
      type: "file"
      request_id: number
      file?: { bytes: Uint8Array<ArrayBuffer>; file_name: string }
      error?: string
    }
  | { type: "widget-answer"; request_id: number; outcome: WidgetRequestOutcome | null }
