/**
 * @module use-chat
 * The chat's state, folded from port events: the history, the streamed
 * draft, reactions, and whether the bot is busy. `useChat` is what `<Chat>`
 * renders from; a custom UI can use it alone.
 */
import type { Message } from "@effect-ak/tg-bot-api"
import type { EmulatorDraft } from "@effect-ak/tg-bot-emulator"
import { useEffect, useMemo, useReducer, useRef } from "react"

import type { ChatPortEvent, EmulatorPort, UserFile } from "./port"

/** How long a `send_chat_action` keeps "typing…" on (Telegram: about 5 s). */
export const CHAT_ACTION_MS = 5000

export interface ChatState {
  messages: readonly Message[]
  draft: EmulatorDraft | null
  /** Reactions by message id. */
  reactions: Readonly<Record<number, readonly string[]>>
  /** The user did something and the bot has not answered yet. */
  waiting: boolean
  /** The bot sent a chat action a moment ago. */
  typing: boolean
}

export const initialChatState: ChatState = {
  messages: [],
  draft: null,
  reactions: {},
  waiting: false,
  typing: false
}

export type ChatAction =
  | ChatPortEvent
  | { type: "user_acted" }
  | { type: "typing_over" }
  | { type: "reset" }

const withoutKey = <V>(record: Readonly<Record<number, V>>, key: number): Record<number, V> =>
  Object.fromEntries(Object.entries(record).filter(([k]) => Number(k) !== key))

export const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "reset":
      return initialChatState
    case "user_acted":
      return { ...state, waiting: true }
    case "typing_over":
      return { ...state, typing: false }
    case "bot_idle":
    case "action_error":
      return { ...state, waiting: false }
    case "message": {
      // A message from the bot ends the wait and its "typing…", as in Telegram
      const fromBot = action.message.from?.is_bot === true
      return {
        ...state,
        messages: [...state.messages, action.message],
        waiting: fromBot ? false : state.waiting,
        typing: fromBot ? false : state.typing
      }
    }
    case "message_edited":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.message_id === action.message.message_id ? action.message : m
        )
      }
    case "message_deleted":
      return {
        ...state,
        messages: state.messages.filter((m) => m.message_id !== action.message_id),
        reactions: withoutKey(state.reactions, action.message_id)
      }
    case "draft":
      return { ...state, draft: action.draft, waiting: false }
    case "draft_cleared":
      return { ...state, draft: null }
    case "chat_action":
      return { ...state, typing: true }
    case "reactions":
      return {
        ...state,
        reactions:
          action.reactions.length === 0
            ? withoutKey(state.reactions, action.message_id)
            : { ...state.reactions, [action.message_id]: action.reactions }
      }
    default:
      return state
  }
}

export interface ChatActions {
  send(text: string, options?: { reply_to?: number }): void
  sendFile(file: UserFile): void
  tapButton(callback_data: string, message_id: number): void
  react(message_id: number, emoji: string | null): void
  deleteMessage(message_id: number): void
}

/**
 * Follow a port's chat. A new port starts a new chat: the state resets.
 * `onEvent` sees every port event (for toasts, logs) after it is applied.
 */
export const useChat = (
  port: EmulatorPort,
  onEvent?: (event: ChatPortEvent) => void
): { state: ChatState; actions: ChatActions } => {
  const [state, dispatch] = useReducer(chatReducer, initialChatState)
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  useEffect(() => {
    dispatch({ type: "reset" })
    let typingTimer: ReturnType<typeof setTimeout> | undefined
    const unsubscribe = port.subscribe((event) => {
      dispatch(event)
      if (event.type === "chat_action") {
        clearTimeout(typingTimer)
        typingTimer = setTimeout(() => dispatch({ type: "typing_over" }), CHAT_ACTION_MS)
      }
      onEventRef.current?.(event)
    })
    return () => {
      clearTimeout(typingTimer)
      unsubscribe()
    }
  }, [port])

  const actions = useMemo<ChatActions>(() => {
    // A message, a file or a tap waits for the bot; a reaction or a delete does not
    const acted = () => dispatch({ type: "user_acted" })
    return {
      send: (text, options = {}) => {
        acted()
        port.sendMessage(text, options)
      },
      sendFile: (file) => {
        acted()
        port.sendFile(file)
      },
      tapButton: (callback_data, message_id) => {
        acted()
        port.tapButton(callback_data, message_id)
      },
      react: (message_id, emoji) => port.react(message_id, emoji),
      deleteMessage: (message_id) => port.deleteMessage(message_id)
    }
  }, [port])

  return { state, actions }
}
