/**
 * @module outgoing
 * Shared pieces of every outgoing (bot-sent) message: base fields,
 * inline keyboard, caption parsing, and `reply_parameters` resolution.
 */
import type {
  InlineKeyboardMarkup,
  Message,
  ReplyKeyboardMarkup,
  ReplyParameters
} from "@effect-ak/tg-bot-api"
import type { FileContent } from "@effect-ak/tg-bot-client"

import type { EmulatorState } from "./state"
import { parseOutgoingText } from "./text"

export const isInlineKeyboard = (markup: unknown): markup is InlineKeyboardMarkup =>
  typeof markup === "object" && markup !== null && "inline_keyboard" in markup

const isReplyKeyboard = (markup: unknown): markup is ReplyKeyboardMarkup =>
  typeof markup === "object" && markup !== null && "keyboard" in markup

const isKeyboardRemove = (markup: unknown): boolean =>
  typeof markup === "object" && markup !== null && "remove_keyboard" in markup

export const isFileContent = (value: unknown): value is FileContent =>
  typeof value === "object" &&
  value !== null &&
  "file_content" in value &&
  value.file_content instanceof Uint8Array &&
  "file_name" in value &&
  typeof value.file_name === "string"

export interface OutgoingInput {
  reply_markup?: unknown
  reply_parameters?: ReplyParameters
  caption?: string
  parse_mode?: string
}

/**
 * Base fields of a new bot message: id, date, chat, author, markup, reply.
 * An inline keyboard goes into the message; a reply keyboard (or its
 * removal) changes the chat's keyboard instead, as in Telegram.
 */
export const outgoingBase = (state: EmulatorState, input: OutgoingInput): Message => {
  if (isReplyKeyboard(input.reply_markup)) state.setReplyKeyboard(input.reply_markup)
  else if (isKeyboardRemove(input.reply_markup)) state.setReplyKeyboard(null)
  const replyId = input.reply_parameters?.message_id
  const replyTo =
    replyId !== undefined ? state.messages.find((m) => m.message_id === replyId) : undefined
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
