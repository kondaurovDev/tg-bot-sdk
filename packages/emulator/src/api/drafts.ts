/**
 * @module api-drafts
 * Streaming drafts (Bot API 9.3+) and rich messages (Bot API 10.1+):
 * `send_message_draft`, `send_rich_message_draft`, `send_rich_message`.
 * A draft is an ephemeral preview; sending any message finalizes it.
 */
import type {
  Message,
  SendMessageDraftInput,
  SendRichMessageDraftInput,
  SendRichMessageInput
} from "@effect-ak/tg-bot-api"

import { EmulatorApiError } from "../errors"
import { outgoingBase } from "../outgoing"
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

const requireDraftId = (draft_id: unknown): number => {
  if (typeof draft_id !== "number" || draft_id === 0) {
    throw new EmulatorApiError(400, "Bad Request: draft_id must be a non-zero number")
  }
  return draft_id
}

export const draftMethods = (state: EmulatorState) => ({
  send_message_draft: (input: SendMessageDraftInput): boolean => {
    const draft_id = requireDraftId(input.draft_id)
    // An empty text shows the "Thinking…" placeholder
    if (!input.text) {
      state.setDraft({
        draft_id,
        thinking: true,
        ...(input.can_stop !== undefined ? { can_stop: input.can_stop } : {})
      })
      return true
    }
    const parsed = parseOutgoingText(input.text, input.parse_mode)
    state.setDraft({
      draft_id,
      thinking: false,
      text: parsed.text,
      ...(parsed.entities ? { entities: parsed.entities } : {}),
      ...(input.can_stop !== undefined ? { can_stop: input.can_stop } : {})
    })
    return true
  },

  send_rich_message_draft: (input: SendRichMessageDraftInput): boolean => {
    const draft_id = requireDraftId(input.draft_id)
    const rich_message = resolveRich(input.rich_message)
    state.setDraft({
      draft_id,
      thinking: rich_message.blocks.length === 0,
      rich_message,
      ...(input.can_stop !== undefined ? { can_stop: input.can_stop } : {})
    })
    return true
  },

  send_rich_message: (input: SendRichMessageInput): Message => {
    const rich_message = resolveRich(input.rich_message)
    state.clearDraft()
    return state.storeMessage({
      ...outgoingBase(state, input),
      rich_message
    })
  }
})
