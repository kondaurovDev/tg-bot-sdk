/**
 * @module emulator
 * Assembles one emulator instance: identities, state, the Bot API
 * method table, the `TgBotClient` facade, and the user-side controls.
 */
import type { Chat, Update, User } from "@effect-ak/tg-bot-api"

import { chatMethods } from "./api/chat"
import { draftMethods } from "./api/drafts"
import { mediaMethods } from "./api/media"
import { messageMethods } from "./api/messages"
import { profileMethods } from "./api/profile"
import { updateMethods } from "./api/updates"
import { widgetMethods } from "./api/widgets"
import { makeEmulatorClient } from "./client"
import { EmulatorState } from "./state"
import { userActions } from "./user"
import type { EmulatorEvent, EmulatorOptions, TgBotEmulator, WaitOptions } from "./types"

type MessageEvent = Extract<EmulatorEvent, { type: "message" }>

export const makeTgBotEmulator = (options: EmulatorOptions = {}): TgBotEmulator => {
  const user: User = {
    id: 1,
    is_bot: false,
    first_name: "You",
    ...options.user
  }

  const bot: User = {
    id: 10_000,
    is_bot: true,
    first_name: "Bot",
    username: "emulator_bot",
    ...options.bot
  }

  const chat: Chat = {
    id: options.chat_id ?? 1,
    type: "private",
    ...(user.first_name ? { first_name: user.first_name } : {})
  }

  const state = new EmulatorState(user, bot, chat)

  const client = makeEmulatorClient(state, {
    ...updateMethods(state),
    ...messageMethods(state),
    ...mediaMethods(state),
    ...draftMethods(state),
    ...chatMethods(state),
    ...profileMethods(state),
    ...widgetMethods(state)
  })

  function nextEvent<E extends EmulatorEvent>(
    match: (event: EmulatorEvent) => event is E,
    options?: WaitOptions
  ): Promise<E>
  function nextEvent(
    match: (event: EmulatorEvent) => boolean,
    options?: WaitOptions
  ): Promise<EmulatorEvent>
  function nextEvent(
    match: (event: EmulatorEvent) => boolean,
    options: WaitOptions = {}
  ): Promise<EmulatorEvent> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        unsubscribe()
        reject(new Error("nextEvent: timed out waiting for a matching event"))
      }, options.timeout ?? 5000)
      const unsubscribe = state.subscribe((event) => {
        if (!match(event)) return
        clearTimeout(timer)
        unsubscribe()
        resolve(event)
      })
    })
  }

  const isBotMessage = (event: EmulatorEvent): event is MessageEvent =>
    event.type === "message" && event.message.from?.id === bot.id

  return {
    client,
    user,
    bot,
    chat,
    get messages() {
      return [...state.messages]
    },
    get draft() {
      return state.activeDraft
    },
    get replyKeyboard() {
      return state.replyKeyboard
    },
    get reactions() {
      return Object.fromEntries(state.reactions)
    },
    get inlineResults() {
      const id = state.lastInlineQueryId
      return id ? [...(state.inlineAnswers.get(id)?.results ?? [])] : []
    },
    ...userActions(state),
    pushUpdate: (update: Omit<Update, "update_id">) => state.pushUpdate(update),
    subscribe: (listener) => state.subscribe(listener),
    nextEvent,
    nextBotMessage: async (options) => (await nextEvent(isBotMessage, options)).message,
    reset: () => state.reset()
  }
}
