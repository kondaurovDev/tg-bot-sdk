/**
 * @module api-chat
 * Chat-level methods: identity, chat actions, callback answers, reactions.
 */
import type {
  AnswerCallbackQueryInput,
  AnswerInlineQueryInput,
  BotCommand,
  BotDescription,
  BotName,
  BotShortDescription,
  ChatFullInfo,
  SetMyCommandsInput,
  SetMyDescriptionInput,
  SetMyNameInput,
  SetMyShortDescriptionInput,
  ReactionType,
  SendChatActionInput,
  SetMessageReactionInput
} from "@effect-ak/tg-bot-api"

import { EmulatorApiError } from "../errors"
import type { EmulatorState } from "../state"

const reactionEmoji = (reaction: ReactionType): string => {
  switch (reaction.type) {
    case "emoji":
      return reaction.emoji
    case "custom_emoji":
      return "🧩"
    default:
      return "⭐"
  }
}

export const chatMethods = (state: EmulatorState) => ({
  get_me: () => state.bot,

  // Bot profile. `language_code` and command `scope` are accepted and
  // ignored: the emulator keeps the default-language, default-scope values.
  get_my_name: (): BotName => ({ name: state.profile.name ?? state.bot.first_name }),
  set_my_name: (input: SetMyNameInput): boolean => {
    if (input.name) state.profile.name = input.name
    else delete state.profile.name
    return true
  },
  get_my_description: (): BotDescription => ({ description: state.profile.description }),
  set_my_description: (input: SetMyDescriptionInput): boolean => {
    state.profile.description = input.description ?? ""
    return true
  },
  get_my_short_description: (): BotShortDescription => ({
    short_description: state.profile.short_description
  }),
  set_my_short_description: (input: SetMyShortDescriptionInput): boolean => {
    state.profile.short_description = input.short_description ?? ""
    return true
  },
  get_my_commands: (): BotCommand[] => [...state.profile.commands],
  set_my_commands: (input: SetMyCommandsInput): boolean => {
    state.profile.commands = [...input.commands]
    return true
  },

  // `get_chat` returns the full info, not the short `Chat` carried by messages:
  // the fields it requires on top get the values of a plain private chat.
  get_chat: (): ChatFullInfo => ({
    ...state.chat,
    accent_color_id: 0,
    max_reaction_count: 11,
    accepted_gift_types: {
      unlimited_gifts: false,
      limited_gifts: false,
      unique_gifts: false,
      premium_subscription: false,
      gifts_from_channels: false
    }
  }),

  send_chat_action: (input: SendChatActionInput): boolean => {
    state.emit({ type: "chat_action", action: input.action })
    return true
  },

  answer_callback_query: (input: AnswerCallbackQueryInput): boolean => {
    state.emit({
      type: "callback_answered",
      callback_query_id: input.callback_query_id,
      ...(input.text ? { text: input.text } : {}),
      ...(input.show_alert !== undefined ? { show_alert: input.show_alert } : {})
    })
    return true
  },

  answer_inline_query: (input: AnswerInlineQueryInput): boolean => {
    const asked = state.inlineAnswers.get(input.inline_query_id)
    if (!asked) {
      throw new EmulatorApiError(400, "Bad Request: query is too old or query ID is invalid")
    }
    asked.results = input.results
    state.emit({
      type: "inline_results",
      inline_query_id: input.inline_query_id,
      results: input.results
    })
    return true
  },

  set_message_reaction: (input: SetMessageReactionInput): boolean => {
    state.findMessage("react to", input.message_id)
    const emojis = (input.reaction ?? []).map(reactionEmoji)
    if (emojis.length === 0) {
      state.reactions.delete(input.message_id)
    } else {
      state.reactions.set(input.message_id, emojis)
    }
    state.emit({ type: "reactions", message_id: input.message_id, reactions: emojis })
    return true
  }
})
