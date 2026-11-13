/**
 * @module port
 * The chat's only way to the emulator: events in, user actions out. The
 * emulator may run in the same thread (`createEmulatorPort`) or in a Web
 * Worker behind `postMessage` — the chat cannot tell the difference.
 */
import type { EmulatorEvent, TgBotEmulator } from "@effect-ak/tg-bot-emulator"

export type ChatPortEvent =
  | EmulatorEvent
  /** The bot has finished handling the last update: the chat stops waiting. */
  | { type: "bot_idle" }
  /** A user action failed (no such button, a message already gone). */
  | { type: "action_error"; error: string }

export interface UserFile {
  bytes: Uint8Array<ArrayBuffer>
  file_name: string
  /** `photo` for images, `document` for anything else. */
  kind: "photo" | "document"
  caption?: string
}

/** A file the bot or the user sent, as the chat downloads it. */
export interface ChatFile {
  bytes: Uint8Array<ArrayBuffer>
  file_name: string
}

export interface EmulatorPort {
  /** Listen to the chat; returns the unsubscribe function. */
  subscribe(listener: (event: ChatPortEvent) => void): () => void
  sendMessage(text: string, options?: { reply_to?: number }): void
  sendFile(file: UserFile): void
  tapButton(callback_data: string, message_id: number): void
  /** Set the user's reaction on a message, or clear it with `null`. */
  react(message_id: number, emoji: string | null): void
  deleteMessage(message_id: number): void
  /** A file's content by its `file_id` (a photo to show, a document to save). */
  getFile(file_id: string): Promise<ChatFile>
}

/**
 * A port to an emulator in the same thread. A failed action is reported as
 * an `action_error` event instead of a throw, as it would be across a worker.
 */
export const createEmulatorPort = (emulator: TgBotEmulator): EmulatorPort => {
  const listeners = new Set<(event: ChatPortEvent) => void>()
  const emit = (event: ChatPortEvent) => {
    for (const listener of listeners) listener(event)
  }
  // On the emulator while anyone listens
  let detach: (() => void) | undefined
  const attempt = (action: () => void) => {
    try {
      action()
    } catch (error) {
      emit({ type: "action_error", error: error instanceof Error ? error.message : String(error) })
    }
  }

  return {
    subscribe(listener) {
      listeners.add(listener)
      detach ??= emulator.subscribe(emit)
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) {
          detach?.()
          detach = undefined
        }
      }
    },
    sendMessage: (text, options = {}) => attempt(() => emulator.sendMessage(text, options)),
    sendFile: ({ bytes, file_name, kind, caption }) =>
      attempt(() => {
        const file = { file_content: bytes, file_name }
        const options = caption === undefined ? {} : { caption }
        if (kind === "photo") emulator.sendPhoto(file, options)
        else emulator.sendDocument(file, options)
      }),
    tapButton: (callback_data, message_id) =>
      attempt(() => emulator.tapButton(callback_data, { message_id })),
    react: (message_id, emoji) => attempt(() => emulator.react(message_id, emoji)),
    deleteMessage: (message_id) => attempt(() => emulator.deleteMessage(message_id)),
    getFile: async (file_id) => {
      const file = await emulator.client.getFile({ fileId: file_id })
      return { bytes: new Uint8Array(file.content), file_name: file.file_name }
    }
  }
}
