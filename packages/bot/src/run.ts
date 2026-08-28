/**
 * @module run
 * Bot execution entry points: long-polling runner ({@link runBot})
 * and webhook handler ({@link createWebhook}).
 */
import type { Update, SetWebhookInput } from "@effect-ak/tg-bot-api"
import { makeTgBotClient, type TgBotClient } from "@effect-ak/tg-bot-client"
import type {
  BotUpdatesHandlers,
  BotLogger,
  RunBotInput,
  HandleResult,
  BotBehavior,
  ClientSource
} from "./types"
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

const resolveClient = (input: ClientSource): TgBotClient => {
  if (input.client) return input.client
  if (input.bot_token) return makeTgBotClient({ bot_token: input.bot_token })
  throw new Error("Either bot_token or client must be provided")
}

const extractBehavior = (input: RunBotInput): BotBehavior => {
  if (input.mode === "batch") {
    return { type: "batch", on_batch: input.on_batch }
  }
  const {
    bot_token: _t,
    client: _c,
    mode,
    poll,
    onUpdate: _,
    onHandleResult: __,
    logger: ___,
    ...handlers
  } = input
  return { type: "single", ...handlers }
}

export const runBot = async (input: RunBotInput): Promise<BotInstance> => {
  const log = input.logger ?? consoleLogger
  const settings = makePollSettings(input.poll ?? {}, log)
  const client = resolveClient(input)
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

export type WebhookBotConfig = BotUpdatesHandlers &
  ClientSource & {
    /**
     * Secret passed to `set_webhook`. Telegram echoes it back in the
     * `X-Telegram-Bot-Api-Secret-Token` header on every delivery; requests
     * whose header is missing or different are rejected with `403`.
     * Strongly recommended — without it anyone who learns the webhook URL
     * can post forged updates. 1-256 characters: `A-Z`, `a-z`, `0-9`, `_`, `-`.
     */
    secret_token?: string
    onHandleResult?: (result: HandleResult) => void
    logger?: BotLogger
  }

export const SECRET_TOKEN_HEADER = "X-Telegram-Bot-Api-Secret-Token"

export type SetWebhookParams = Omit<SetWebhookInput, "secret_token">

export interface WebhookHandler {
  /** Verify the secret token (if configured), parse the update and handle it. */
  (request: Request): Promise<Response>
  /** Handle a raw `Update` object. Bypasses secret token verification. */
  handleUpdate: (update: Update) => Promise<void>
  /**
   * Register this webhook with Telegram (`set_webhook`), passing the same
   * `secret_token` the handler verifies. Throws `TgBotClientError` on failure.
   */
  setWebhook: (params: SetWebhookParams) => Promise<boolean>
}

/** Compares two strings without leaking their common-prefix length. */
const timingSafeEqual = (a: string, b: string): boolean => {
  const encoder = new TextEncoder()
  const bytesA = encoder.encode(a)
  const bytesB = encoder.encode(b)
  const length = Math.max(bytesA.length, bytesB.length)
  let diff = bytesA.length ^ bytesB.length
  for (let i = 0; i < length; i++) {
    diff |= (bytesA[i] ?? 0) ^ (bytesB[i] ?? 0)
  }
  return diff === 0
}

export const createWebhook = (config: WebhookBotConfig): WebhookHandler => {
  const { bot_token: _t, client: _c, secret_token, onHandleResult, logger, ...handlers } = config
  const log = logger ?? consoleLogger
  const client = resolveClient(config)
  const settings = makePollSettings({}, log)

  if (!secret_token) {
    log.warn(
      "webhook: secret_token is not set — anyone who knows the URL can send forged updates. " +
        "Pass `secret_token` to createWebhook / .webhook() and register it via handler.setWebhook()."
    )
  }

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

  const isAuthorized = (request: Request): boolean => {
    if (!secret_token) return true
    const header = request.headers.get(SECRET_TOKEN_HEADER)
    return header !== null && timingSafeEqual(header, secret_token)
  }

  const handler = async (request: Request): Promise<Response> => {
    if (!isAuthorized(request)) {
      log.warn("webhook: rejected request with missing or invalid secret token")
      return new Response("forbidden", { status: 403 })
    }
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
  handler.setWebhook = (params: SetWebhookParams) =>
    client.execute("set_webhook", {
      ...params,
      ...(secret_token ? { secret_token } : {})
    })

  return handler
}
