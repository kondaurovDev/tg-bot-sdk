/**
 * @module chat-services
 * What message content needs from the chat around it: files through the
 * port, widget requests, the clipboard notice. `<Chat>` provides it.
 */
import type { WidgetRequestOutcome } from "@effect-ak/tg-bot-emulator"
import { createContext } from "react"

import type { ChatFile } from "./port"

export interface ChatServices {
  getFile(file_id: string): Promise<ChatFile>
  widgetRequest(message_id: number, data: string): Promise<WidgetRequestOutcome>
  /** Copy to the clipboard and say so. */
  copy(text: string): void
}

export const ChatServicesContext = createContext<ChatServices | null>(null)
