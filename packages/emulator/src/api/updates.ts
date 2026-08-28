/**
 * @module api-updates
 * `get_updates` with real long-poll semantics: an empty queue holds the
 * request until an update is pushed or the timeout elapses; `offset`
 * confirms (drops) delivered updates.
 */
import type { GetUpdatesInput, Update } from "@effect-ak/tg-bot-api"

import type { EmulatorState } from "../state"

export const updateMethods = (state: EmulatorState) => ({
  get_updates: async (input: GetUpdatesInput): Promise<Update[]> => {
    if (input.offset !== undefined && input.offset >= 0) {
      state.pendingUpdates = state.pendingUpdates.filter(
        (u) => u.update_id >= (input.offset as number)
      )
    }
    if (state.pendingUpdates.length === 0 && input.timeout && input.timeout > 0) {
      await state.waitForUpdate(input.timeout)
    }
    return state.pendingUpdates.slice(0, input.limit ?? 100)
  }
})
