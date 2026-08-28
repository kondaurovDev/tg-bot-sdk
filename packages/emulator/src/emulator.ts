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
import { updateMethods } from "./api/updates"
import { makeEmulatorClient } from "./client"
import { EmulatorState } from "./state"
import { userActions } from "./user"
import type { EmulatorEvent, EmulatorOptions, TgBotEmulator, WaitOptions } from "./types"

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
    ...chatMethods(state)
  })

  const nextEvent = (
    match: (event: EmulatorEvent) => boolean,
    options: WaitOptions = {}
  ): Promise<EmulatorEvent> =>
    new Promise((resolve, reject) => {
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
    nextBotMessage: async (options) => {
      const event = await nextEvent(
        (e) => e.type === "message" && e.message.from?.id === bot.id,
        options
      )
      return (event as Extract<EmulatorEvent, { type: "message" }>).message
    },
    reset: () => state.reset()
  }
}
