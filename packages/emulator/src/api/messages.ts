/**
 * @module api-messages
 * Text messaging methods: send, edit, delete, forward, copy.
 */
import type {
  CopyMessageInput,
  DeleteMessageInput,
  DeleteMessagesInput,
  EditMessageCaptionInput,
  EditMessageReplyMarkupInput,
  EditMessageTextInput,
  ForwardMessageInput,
  Message,
  SendMessageInput
} from "@effect-ak/tg-bot-api"

import { EmulatorApiError } from "../errors"
import { captionFields, isInlineKeyboard, outgoingBase } from "../outgoing"
import { resolveInputRichMessage, RichInputError } from "../rich"
import type { EmulatorState } from "../state"
import { parseOutgoingText } from "../text"

const resolveRich = (input: Parameters<typeof resolveInputRichMessage>[0]) => {
  try {
    return resolveInputRichMessage(input)
  } catch (error) {
    if (error instanceof RichInputError) throw new EmulatorApiError(400, error.message)
    throw error
  }
}

export const messageMethods = (state: EmulatorState) => ({
  send_message: (input: SendMessageInput): Message => {
    state.clearDraft()
    const parsed = parseOutgoingText(input.text, input.parse_mode)
    return state.storeMessage({
      ...outgoingBase(state, input),
      text: parsed.text,
      ...(parsed.entities ? { entities: parsed.entities } : {})
    })
  },

  edit_message_text: (input: EditMessageTextInput): Message => {
    const message = state.findMessage("edit", input.message_id)
    if (input.text !== undefined) {
      const parsed = parseOutgoingText(input.text, input.parse_mode)
      message.text = parsed.text
      if (parsed.entities) message.entities = parsed.entities
      else delete message.entities
    }
    // Bot API 10.1: an edit may replace the content with a rich message
    if (input.rich_message) {
      message.rich_message = resolveRich(input.rich_message)
    }
    if (input.reply_markup) {
      message.reply_markup = input.reply_markup
    } else {
      delete message.reply_markup
    }
    state.emit({ type: "message_edited", message })
    return message
  },

  edit_message_caption: (input: EditMessageCaptionInput): Message => {
    const message = state.findMessage("edit", input.message_id)
    const fields = captionFields(input)
    if (fields.caption !== undefined) {
      message.caption = fields.caption
      if (fields.caption_entities) message.caption_entities = fields.caption_entities
      else delete message.caption_entities
    } else {
      delete message.caption
      delete message.caption_entities
    }
    state.emit({ type: "message_edited", message })
    return message
  },

  edit_message_reply_markup: (input: EditMessageReplyMarkupInput): Message => {
    const message = state.findMessage("edit", input.message_id)
    if (input.reply_markup) {
      message.reply_markup = input.reply_markup
    } else {
      delete message.reply_markup
    }
    state.emit({ type: "message_edited", message })
    return message
  },

  delete_message: (input: DeleteMessageInput): boolean => {
    state.findMessage("delete", input.message_id)
    state.messages = state.messages.filter((m) => m.message_id !== input.message_id)
    state.emit({ type: "message_deleted", message_id: input.message_id })
    return true
  },

  delete_messages: (input: DeleteMessagesInput): boolean => {
    for (const message_id of input.message_ids) {
      state.messages = state.messages.filter((m) => m.message_id !== message_id)
      state.emit({ type: "message_deleted", message_id })
    }
    return true
  },

  forward_message: (input: ForwardMessageInput): Message => {
    const original = state.findMessage("forward", input.message_id)
    return state.storeMessage({
      ...original,
      message_id: state.nextMessageId++,
      date: state.nowSeconds(),
      from: state.bot,
      forward_origin: {
        type: "user",
        date: original.date,
        sender_user: original.from ?? state.bot
      }
    })
  },

  copy_message: (input: CopyMessageInput): { message_id: number } => {
    // A copy, unlike a forward, has no link back to the original
    const { forward_origin: _origin, ...original } = state.findMessage("copy", input.message_id)
    const copy = state.storeMessage({
      ...original,
      message_id: state.nextMessageId++,
      date: state.nowSeconds(),
      from: state.bot,
      ...(isInlineKeyboard(input.reply_markup) ? { reply_markup: input.reply_markup } : {})
    })
    return { message_id: copy.message_id }
  }
})
