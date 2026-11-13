/**
 * @module api-widgets
 * HTML widgets (Bot API 10.4): sending static and shared widgets, answering
 * the requests a widget sends, and changing a widget's state. The emulator
 * models the production setup — widgets in the private chat with the bot,
 * protected content, no forwards — and checks the documented size limits.
 * The compressed-size limit (4096 bytes after zlib) is not checked.
 */
import type {
  AnswerWidgetQueryInput,
  EditMessageWidgetDataInput,
  EditSharedWidgetDataInput,
  Message,
  SendSharedWidgetInput,
  SendWidgetInput,
  Widget
} from "@effect-ak/tg-bot-api"

import { EmulatorApiError } from "../errors"
import { captionFields, outgoingBase } from "../outgoing"
import type { EmulatorState, WidgetMeta } from "../state"

const byteLength = (value: string): number => new TextEncoder().encode(value).byteLength

/** Throws the 400 the API answers when a string is outside its byte limits. */
const checkBytes = (field: string, value: string | undefined, min: number, max: number) => {
  if (value === undefined) return
  const size = byteLength(value)
  if (size < min || size > max) {
    throw new EmulatorApiError(
      400,
      `Bad Request: ${field} must be ${min}-${max} bytes, got ${size}`
    )
  }
}

const checkData = (input: { public_data?: string; chat_data?: string }) => {
  checkBytes("public_data", input.public_data, 0, 1024)
  checkBytes("chat_data", input.chat_data, 0, 1024)
}

/** An empty string removes the value; `undefined` keeps it. */
const nextValue = (current: string | undefined, update: string | undefined) =>
  update === undefined ? current : update === "" ? undefined : update

const withData = (
  widget: Widget,
  public_data: string | undefined,
  chat_data: string | undefined
): Widget => {
  const { public_data: _p, chat_data: _c, ...rest } = widget
  return {
    ...rest,
    ...(public_data !== undefined ? { public_data } : {}),
    ...(chat_data !== undefined ? { chat_data } : {})
  }
}

export const widgetMethods = (state: EmulatorState) => {
  const sendWidgetMessage = (
    input: SendWidgetInput | SendSharedWidgetInput,
    widget: Widget,
    meta: WidgetMeta
  ): Message => {
    state.clearDraft()
    const message = state.storeMessage({
      ...outgoingBase(state, input),
      ...captionFields(input),
      widget,
      // In production a widget message is protected content: it can't be forwarded
      has_protected_content: true,
      ...(input.show_caption_above_media ? { show_caption_above_media: true } : {})
    })
    state.widgetMeta.set(message.message_id, meta)
    return message
  }

  /** Change the data of one message's widget and tell listeners. */
  const setMessageData = (
    message: Message,
    public_data: string | undefined,
    chat_data: string | undefined
  ) => {
    if (!message.widget) return
    message.widget = withData(message.widget, public_data, chat_data)
    state.emit({
      type: "widget_data_changed",
      message_id: message.message_id,
      widget: message.widget
    })
  }

  /** A shared widget's public data is the same in every message that shows it. */
  const setSharedPublicData = (widget_id: string, public_data: string | undefined) => {
    const shared = state.sharedWidgets.get(widget_id)
    if (shared) {
      const { public_data: _old, ...rest } = shared
      state.sharedWidgets.set(widget_id, {
        ...rest,
        ...(public_data !== undefined ? { public_data } : {})
      })
    }
    for (const message of state.messages) {
      if (message.widget?.id === widget_id) {
        setMessageData(message, public_data, message.widget.chat_data)
      }
    }
  }

  return {
    send_widget: (input: SendWidgetInput): Message => {
      checkBytes("html", input.html, 1, 32768)
      checkData(input)
      const size = {
        ...(input.width !== undefined ? { width: input.width } : {}),
        ...(input.height !== undefined ? { height: input.height } : {})
      }
      const allow_queries = input.allow_queries ?? false
      let widget_id: string | undefined
      if (input.is_shared) {
        widget_id = `emu-widget-${state.nextWidgetId++}`
        state.sharedWidgets.set(widget_id, {
          widget_id,
          html: input.html,
          ...size,
          ...(input.public_data ? { public_data: input.public_data } : {}),
          allow_queries
        })
      }
      return sendWidgetMessage(
        input,
        {
          html: input.html,
          ...size,
          ...(input.public_data ? { public_data: input.public_data } : {}),
          ...(input.chat_data ? { chat_data: input.chat_data } : {}),
          ...(widget_id ? { id: widget_id } : {})
        },
        { allow_queries, ...(widget_id ? { widget_id } : {}) }
      )
    },

    send_shared_widget: (input: SendSharedWidgetInput): Message => {
      const shared = state.sharedWidgets.get(input.widget_id)
      if (!shared) throw new EmulatorApiError(400, "Bad Request: widget not found")
      checkData(input)
      const { widget_id, allow_queries, ...look } = shared
      return sendWidgetMessage(
        input,
        { ...look, id: widget_id, ...(input.chat_data ? { chat_data: input.chat_data } : {}) },
        { allow_queries, widget_id }
      )
    },

    answer_widget_query: (input: AnswerWidgetQueryInput): boolean => {
      const resolve = state.widgetQueries.get(input.widget_query_id)
      if (!resolve) {
        throw new EmulatorApiError(
          400,
          "Bad Request: query is too old and response timeout expired or query ID is invalid"
        )
      }
      state.widgetQueries.delete(input.widget_query_id)
      if (input.data !== undefined && byteLength(input.data) > 1024) {
        // The answer never reaches the widget
        resolve({ ok: false, code: "INVALID_ANSWER" })
        checkBytes("data", input.data, 0, 1024)
      }
      resolve({ ok: true, result: input.data ?? null })
      state.emit({
        type: "widget_answered",
        widget_query_id: input.widget_query_id,
        ...(input.data !== undefined ? { data: input.data } : {})
      })
      return true
    },

    edit_message_widget_data: (input: EditMessageWidgetDataInput): boolean => {
      if (input.inline_message_id !== undefined) {
        throw new EmulatorApiError(400, "Bad Request: inline messages are not emulated")
      }
      const message = state.findMessage("edit", input.message_id)
      if (!message.widget) throw new EmulatorApiError(400, "Bad Request: the message has no widget")
      checkData(input)
      const public_data = nextValue(message.widget.public_data, input.public_data)
      const chat_data = nextValue(message.widget.chat_data, input.chat_data)
      if (public_data === message.widget.public_data && chat_data === message.widget.chat_data) {
        throw new EmulatorApiError(400, "Bad Request: message is not modified")
      }
      const widget_id = message.widget.id
      if (widget_id && public_data !== message.widget.public_data) {
        setSharedPublicData(widget_id, public_data)
      }
      setMessageData(message, public_data, chat_data)
      return true
    },

    edit_shared_widget_data: (input: EditSharedWidgetDataInput): boolean => {
      const shared = state.sharedWidgets.get(input.widget_id)
      if (!shared) throw new EmulatorApiError(400, "Bad Request: widget not found")
      checkData(input)
      if (input.cache_time !== undefined && (input.cache_time < 5 || input.cache_time > 3600)) {
        throw new EmulatorApiError(400, "Bad Request: cache_time must be 5-3600")
      }
      const public_data = nextValue(shared.public_data, input.public_data)
      if (public_data === shared.public_data) {
        throw new EmulatorApiError(400, "Bad Request: message is not modified")
      }
      setSharedPublicData(input.widget_id, public_data)
      return true
    }
  }
}
