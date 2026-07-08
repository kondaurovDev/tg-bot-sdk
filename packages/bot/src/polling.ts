/**
 * @module polling
 * Long-polling infrastructure: settings validation and the UpdateFetcher
 * that pulls updates from the Telegram API in a loop.
 */
import type { Update } from "@effect-ak/tg-bot-api"
import type { TgBotClient } from "@effect-ak/tg-bot-client"
import type { BotLogger } from "./types"

// ---------------------------------------------------------------------------
// PollSettings
// ---------------------------------------------------------------------------

export interface PollSettings {
  log_level: "info" | "debug"
  on_error: "stop" | "continue"
  batch_size: number
  poll_timeout: number
  max_empty_responses: number | undefined
}

export function makePollSettings(input: Partial<PollSettings>, log: BotLogger): PollSettings {
  let batch_size = input.batch_size ?? 10
  let poll_timeout = input.poll_timeout ?? 10
  let max_empty_responses = input.max_empty_responses
  let log_level = input.log_level ?? "info"
  let on_error = input.on_error ?? "stop"

  if (batch_size < 10 || batch_size > 100) {
    log.warn("Wrong batch_size, must be in [10..100], using 10 instead")
    batch_size = 10
  }

  if (poll_timeout < 2 || poll_timeout > 120) {
    log.warn("Wrong poll_timeout, must be in [2..120], using 20 instead")
    poll_timeout = 20
  }

  if (max_empty_responses && max_empty_responses < 2) {
    log.warn("Wrong max_empty_responses, must be in [2..infinity], using infinity")
    max_empty_responses = undefined
  }

  const settings: PollSettings = {
    batch_size,
    poll_timeout,
    max_empty_responses,
    log_level,
    on_error
  }

  log.debug("bot poll settings", settings)

  return settings
}

// ---------------------------------------------------------------------------
// UpdateFetcher
// ---------------------------------------------------------------------------

export class UpdateFetcher {
  private lastUpdateId: number | undefined
  private emptyResponses = 0

  constructor(
    private client: TgBotClient,
    private settings: PollSettings
  ) {}

  async fetchUpdates(): Promise<Update[]> {
    if (
      this.settings.max_empty_responses &&
      this.emptyResponses >= this.settings.max_empty_responses
    ) {
      throw new Error("TooManyEmptyResponses")
    }

    if (this.settings.log_level === "debug") {
      console.debug("getting updates", {
        lastUpdateId: this.lastUpdateId,
        emptyResponses: this.emptyResponses
      })
    }

    // fetch timeout must exceed the long-poll timeout Telegram holds the request for
    const result = await this.client.executeSafe(
      "get_updates",
      {
        timeout: this.settings.poll_timeout,
        ...(this.lastUpdateId ? { offset: this.lastUpdateId } : undefined)
      },
      { timeout: (this.settings.poll_timeout + 10) * 1000 }
    )

    if (!result.ok) {
      throw new Error(`Failed to fetch updates: ${result.error._tag}`)
    }

    const sorted = result.data.sort((a, b) => a.update_id - b.update_id)

    if (sorted.length > 0) {
      const lastId = sorted[sorted.length - 1].update_id
      if (this.settings.log_level === "debug") {
        console.debug("updating last update id", lastId)
      }
      this.lastUpdateId = lastId + 1
      this.emptyResponses = 0
    } else {
      this.emptyResponses += 1
    }

    return sorted
  }

  async commit(): Promise<void> {
    if (!this.lastUpdateId) return

    if (this.settings.log_level === "debug") {
      console.debug("committing offset", this.lastUpdateId)
    }

    const result = await this.client.executeSafe("get_updates", {
      offset: this.lastUpdateId
    })

    if (!result.ok) {
      throw new Error(`Failed to commit offset: ${result.error._tag}`)
    }

    if (this.settings.log_level === "debug") {
      console.debug("committed offset", this.lastUpdateId)
    }
  }
}
