/**
 * @module run
 * Bot execution entry points: long-polling runner ({@link runBot})
 * and webhook handler ({@link createWebhook}).
 */
import type { Update } from "@effect-ak/tg-bot-api"
import { makeTgBotClient } from "@effect-ak/tg-bot-client"
import type { BotUpdatesHandlers, BotLogger, RunBotInput, HandleResult, BotBehavior } from "./types"
import { makePollSettings, UpdateFetcher } from "./polling"
import { handleUpdates } from "./bot-processor"

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

const consoleLogger: BotLogger = {
  debug: (msg, data) => console.debug(msg, ...(data !== undefined ? [data] : [])),
  info: (msg, data) => console.log(msg, ...(data !== undefined ? [data] : [])),
  warn: (msg, data) => console.warn(msg, ...(data !== undefined ? [data] : [])),
  error: (msg, data) => console.error(msg, ...(data !== undefined ? [data] : []))
}

// ---------------------------------------------------------------------------
// Polling
// ---------------------------------------------------------------------------

export interface BotInstance {
  stop(): void
  reload(behavior: BotBehavior): void
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const extractBehavior = (input: RunBotInput): BotBehavior => {
  if (input.mode === "batch") {
    return { type: "batch", on_batch: input.on_batch }
  }
  const { bot_token, mode, poll, onUpdate: _, onHandleResult: __, logger: ___, ...handlers } = input
  return { type: "single", ...handlers }
}

export const runBot = async (input: RunBotInput): Promise<BotInstance> => {
  const log = input.logger ?? consoleLogger
  const settings = makePollSettings(input.poll ?? {}, log)
  const client = makeTgBotClient({ bot_token: input.bot_token })
  const fetcher = new UpdateFetcher(client, settings)
  let behavior = extractBehavior(input)

  const abortController = new AbortController()

  const poll = async () => {
    if (settings.log_level === "debug") {
      log.debug("running telegram chat bot")
      log.debug("Fetching bot updates via long polling...")
    }

    while (!abortController.signal.aborted) {
      try {
        const updates = await fetcher.fetchUpdates()
        if (input.onUpdate) {
          for (const u of updates) input.onUpdate(u)
        }
        const result = await handleUpdates(
          updates,
          behavior,
          client,
          settings,
          log,
          input.onHandleResult
        )

        if (updates.length > 0 && !result.hasErrors) {
          await fetcher.commit()
        }

        if (result.hasErrors && settings.on_error === "stop") {
          log.warn("stopping bot due to error (on_error=stop)")
          break
        }
      } catch (error) {
        log.error("polling error", error instanceof Error ? error.message : error)
        if (settings.on_error === "stop") break
      }

      await delay(1000)
    }

    if (settings.log_level === "debug") {
      log.debug("bot polling stopped")
    }
  }

  poll()

  return {
    stop: () => abortController.abort(),
    reload: (newBehavior: BotBehavior) => {
      behavior = newBehavior
    }
  }
}

export const defineBot = (input: BotUpdatesHandlers) => {
  if (Object.keys(input).length === 0) console.warn("No handlers are defined for bot")
  return input
}

// ---------------------------------------------------------------------------
// Webhook
// ---------------------------------------------------------------------------

export interface WebhookBotConfig extends BotUpdatesHandlers {
  bot_token: string
  onHandleResult?: (result: HandleResult) => void
  logger?: BotLogger
}

export interface WebhookHandler {
  (request: Request): Promise<Response>
  handleUpdate: (update: Update) => Promise<void>
}

export const createWebhook = (config: WebhookBotConfig): WebhookHandler => {
  const { bot_token, onHandleResult, logger, ...handlers } = config
  const log = logger ?? consoleLogger
  const client = makeTgBotClient({ bot_token })
  const settings = makePollSettings({}, log)

  const handleUpdate = async (update: Update): Promise<void> => {
    await handleUpdates(
      [update],
      { type: "single", ...handlers },
      client,
      settings,
      log,
      onHandleResult
    )
  }

  const handler = async (request: Request): Promise<Response> => {
    try {
      const update = (await request.json()) as Update
      await handleUpdate(update)
      return new Response("ok", { status: 200 })
    } catch (error) {
      log.error("Webhook error", error)
      return new Response("error", { status: 500 })
    }
  }

  handler.handleUpdate = handleUpdate

  return handler
}
