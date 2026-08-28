/**
 * @module outgoing
 * Shared pieces of every outgoing (bot-sent) message: base fields,
 * inline keyboard, caption parsing, and `reply_parameters` resolution.
 */
import type { InlineKeyboardMarkup, Message, ReplyParameters } from "@effect-ak/tg-bot-api"
import type { FileContent } from "@effect-ak/tg-bot-client"

import type { EmulatorState } from "./state"
import { parseOutgoingText } from "./text"

export const isInlineKeyboard = (markup: unknown): markup is InlineKeyboardMarkup =>
  typeof markup === "object" && markup !== null && "inline_keyboard" in markup

export const isFileContent = (value: unknown): value is FileContent =>
  typeof value === "object" &&
  value !== null &&
  "file_content" in value &&
  (value as FileContent).file_content instanceof Uint8Array &&
  "file_name" in value

export interface OutgoingInput {
  reply_markup?: unknown
  reply_parameters?: ReplyParameters
  caption?: string
  parse_mode?: string
}

/** Base fields of a new bot message: id, date, chat, author, markup, reply. */
export const outgoingBase = (state: EmulatorState, input: OutgoingInput): Message => {
  const replyTo =
    input.reply_parameters?.message_id !== undefined
      ? state.messages.find((m) => m.message_id === input.reply_parameters!.message_id)
      : undefined
  return {
    message_id: state.nextMessageId++,
    date: state.nowSeconds(),
    chat: state.chat,
    from: state.bot,
    ...(isInlineKeyboard(input.reply_markup) ? { reply_markup: input.reply_markup } : {}),
    ...(replyTo ? { reply_to_message: replyTo } : {})
  }
}

/** `caption` + `parse_mode` → `caption` + `caption_entities` fields. */
export const captionFields = (input: OutgoingInput): Partial<Message> => {
  if (!input.caption) return {}
  const parsed = parseOutgoingText(input.caption, input.parse_mode)
  return {
    caption: parsed.text,
    ...(parsed.entities ? { caption_entities: parsed.entities } : {})
  }
}
