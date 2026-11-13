/**
 * @module user
 * The virtual user's side of the chat: everything a human could do in
 * the Telegram client — send text and media, tap buttons, edit own
 * messages, react, type inline queries and pick results. Each action
 * mutates the chat history and delivers the corresponding update.
 */
import type {
  CallbackQuery,
  ChosenInlineResult,
  InlineQuery,
  Message,
  ReactionType
} from "@effect-ak/tg-bot-api"
import type { FileContent } from "@effect-ak/tg-bot-client"

import { isInlineKeyboard } from "./outgoing"
import type { EmulatorState } from "./state"
import { commandEntities } from "./text"
import type {
  TapButtonOptions,
  UserMediaOptions,
  UserSendOptions,
  WidgetRequestOptions,
  WidgetRequestOutcome
} from "./types"

const hasButton = (message: Message, callback_data: string): boolean =>
  isInlineKeyboard(message.reply_markup) &&
  message.reply_markup.inline_keyboard.some((row) =>
    row.some((button) => button.callback_data === callback_data)
  )

export const userActions = (state: EmulatorState) => {
  const baseMessage = (): Message => ({
    message_id: state.nextMessageId++,
    date: state.nowSeconds(),
    chat: state.chat,
    from: state.user
  })

  const deliver = (message: Message): Message => {
    state.storeMessage(message)
    state.pushUpdate({ message })
    return message
  }

  const sendMessage = (text: string, options: UserSendOptions = {}): Message => {
    const entities = commandEntities(text)
    const replyTo =
      options.reply_to !== undefined
        ? state.messages.find((m) => m.message_id === options.reply_to)
        : undefined
    return deliver({
      ...baseMessage(),
      text,
      ...(entities ? { entities } : {}),
      ...(replyTo ? { reply_to_message: replyTo } : {})
    })
  }

  const deleteMessage = (message_id: number): void => {
    const exists = state.messages.some((m) => m.message_id === message_id)
    if (!exists) throw new Error(`deleteMessage: message ${message_id} not found`)
    state.messages = state.messages.filter((m) => m.message_id !== message_id)
    state.reactions.delete(message_id)
    state.emit({ type: "message_deleted", message_id })
  }

  const sendUserMedia = (
    file: FileContent,
    options: UserMediaOptions,
    fields: (file_id: string) => Partial<Message>
  ): Message => {
    const file_id = state.registerUpload({
      content: file.file_content,
      file_name: file.file_name
    })
    return deliver({
      ...baseMessage(),
      ...fields(file_id),
      ...(options.caption ? { caption: options.caption } : {})
    })
  }

  const sendPhoto = (file: FileContent, options: UserMediaOptions = {}): Message =>
    sendUserMedia(file, options, (file_id) => ({
      photo: [
        {
          file_id,
          file_unique_id: `${file_id}-u`,
          width: 800,
          height: 600,
          file_size: file.file_content.byteLength
        }
      ]
    }))

  const sendDocument = (file: FileContent, options: UserMediaOptions = {}): Message =>
    sendUserMedia(file, options, (file_id) => ({
      document: {
        file_id,
        file_unique_id: `${file_id}-u`,
        file_name: file.file_name,
        file_size: file.file_content.byteLength
      }
    }))

  const tapButton = (callback_data: string, options: TapButtonOptions = {}): CallbackQuery => {
    const message =
      options.message_id !== undefined
        ? state.findMessage("tap a button in", options.message_id)
        : [...state.messages].reverse().find((m) => hasButton(m, callback_data))
    if (!message || !hasButton(message, callback_data)) {
      throw new Error(`tapButton: no message has a button with callback_data "${callback_data}"`)
    }
    const callback_query: CallbackQuery = {
      id: String(state.nextCallbackId++),
      from: state.user,
      chat_instance: String(state.chat.id),
      message,
      data: callback_data
    }
    state.pushUpdate({ callback_query })
    return callback_query
  }

  const editMessage = (message_id: number, text: string): Message => {
    const message = state.messages.find((m) => m.message_id === message_id)
    if (!message) throw new Error(`editMessage: message ${message_id} not found`)
    if (message.from?.id !== state.user.id) {
      throw new Error("editMessage: only the user's own messages can be edited")
    }
    message.text = text
    const entities = commandEntities(text)
    if (entities) message.entities = entities
    else delete message.entities
    message.edit_date = state.nowSeconds()
    state.emit({ type: "message_edited", message })
    state.pushUpdate({ edited_message: message })
    return message
  }

  // The spec narrows `emoji` to the reactions Telegram offers. The user side
  // takes any string and stays lenient, so this is a deliberate assertion.
  const toReactionTypes = (emojis: readonly string[]): ReactionType[] =>
    // oxlint-disable-next-line typescript/consistent-type-assertions
    emojis.map((emoji) => ({ type: "emoji", emoji }) as ReactionType)

  const react = (message_id: number, emoji: string | null): void => {
    state.findMessage("react to", message_id)
    const old = state.reactions.get(message_id) ?? []
    const next = emoji ? [emoji] : []
    if (next.length === 0) state.reactions.delete(message_id)
    else state.reactions.set(message_id, next)
    state.emit({ type: "reactions", message_id, reactions: next })
    state.pushUpdate({
      message_reaction: {
        chat: state.chat,
        message_id,
        date: state.nowSeconds(),
        user: state.user,
        old_reaction: toReactionTypes(old),
        new_reaction: toReactionTypes(next)
      }
    })
  }

  const sendInlineQuery = (query: string): InlineQuery => {
    const inline_query: InlineQuery = {
      id: String(state.nextInlineQueryId++),
      from: state.user,
      query,
      offset: "",
      chat_type: "private"
    }
    state.inlineAnswers.set(inline_query.id, { query, results: [] })
    state.lastInlineQueryId = inline_query.id
    state.pushUpdate({ inline_query })
    return inline_query
  }

  const chooseInlineResult = (result_id: string): ChosenInlineResult => {
    for (const [, answer] of [...state.inlineAnswers].reverse()) {
      const result = answer.results.find((r) => "id" in r && r.id === result_id)
      if (!result) continue
      const chosen: ChosenInlineResult = {
        result_id,
        from: state.user,
        query: answer.query
      }
      state.pushUpdate({ chosen_inline_result: chosen })
      const content = "input_message_content" in result ? result.input_message_content : undefined
      if (content && "message_text" in content) sendMessage(content.message_text)
      return chosen
    }
    throw new Error(`chooseInlineResult: no answered result with id "${result_id}"`)
  }

  const widgetRequest = (
    message_id: number,
    data: string,
    options: WidgetRequestOptions = {}
  ): Promise<WidgetRequestOutcome> => {
    const message = state.messages.find((m) => m.message_id === message_id)
    if (!message?.widget) throw new Error(`widgetRequest: message ${message_id} has no widget`)
    const size = new TextEncoder().encode(data).byteLength
    if (size < 1 || size > 64) {
      throw new TypeError(`widgetRequest: data must be 1-64 bytes, got ${size}`)
    }
    const meta = state.widgetMeta.get(message_id)
    if (!meta?.allow_queries) return Promise.resolve({ ok: false, code: "NOT_ALLOWED" })
    if (state.busyWidgets.has(message_id)) return Promise.resolve({ ok: false, code: "BUSY" })

    const id = `emu-widget-query-${state.nextWidgetQueryId++}`
    state.busyWidgets.add(message_id)
    return new Promise((resolve) => {
      const finish = (outcome: WidgetRequestOutcome) => {
        clearTimeout(timer)
        state.widgetQueries.delete(id)
        state.busyWidgets.delete(message_id)
        resolve(outcome)
      }
      const timer = setTimeout(
        () => finish({ ok: false, code: "TIMEOUT" }),
        options.timeout ?? 15_000
      )
      state.widgetQueries.set(id, finish)
      state.pushUpdate({
        widget_query: {
          id,
          from: state.user,
          chat: state.chat,
          message_id,
          chat_instance: String(state.chat.id),
          type: { type: "data" },
          data,
          ...(meta.widget_id ? { widget_id: meta.widget_id } : {})
        }
      })
    })
  }

  return {
    widgetRequest,
    sendMessage,
    deleteMessage,
    sendPhoto,
    sendDocument,
    tapButton,
    editMessage,
    react,
    sendInlineQuery,
    chooseInlineResult
  }
}
