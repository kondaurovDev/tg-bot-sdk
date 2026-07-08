/**
 * @module bot-processor
 * Update processing pipeline: extracts the update type, matches it to
 * the registered handler (function, guard, or guard array), executes
 * the handler, and sends the response back to Telegram.
 */
import type { Update } from "@effect-ak/tg-bot-api"
import type { TgBotClient } from "@effect-ak/tg-bot-client"
import type {
  AvailableUpdateTypes,
  ExtractedUpdate,
  BotUpdatesHandlers,
  HandleBatchUpdateFunction,
  HandleResult,
  UpdateHandler,
  GuardedHandler,
  BotContext,
  BotLogger,
  BotBehavior
} from "./types"
import { createBotContext, BotResponse } from "./types"
import type { PollSettings } from "./polling"

export interface BatchUpdateResult {
  hasErrors: boolean
  updates: Update[]
}

const isGuardedHandler = <U>(handler: UpdateHandler<U>): handler is GuardedHandler<U> =>
  typeof handler === "object" && handler !== null && "handle" in handler

const executeSingleGuard = async <U>(
  guard: GuardedHandler<U>,
  update: U,
  ctx: BotContext
): Promise<BotResponse | null> => {
  const input = { update, ctx }
  if (guard.match) {
    const matched = await guard.match(input)
    if (!matched) return null
  }
  return await guard.handle(input)
}

const executeGuards = async <U>(
  guards: GuardedHandler<U>[],
  update: U,
  ctx: BotContext
): Promise<BotResponse> => {
  for (const guard of guards) {
    const result = await executeSingleGuard(guard, update, ctx)
    if (result !== null) return result
  }
  return BotResponse.ignore
}

const executeHandler = async <U>(
  handler: UpdateHandler<U>,
  update: U,
  ctx: BotContext
): Promise<BotResponse> => {
  if (typeof handler === "function") {
    return await handler(update)
  }
  if (Array.isArray(handler)) {
    return await executeGuards(handler, update, ctx)
  }
  if (isGuardedHandler(handler)) {
    const result = await executeSingleGuard(handler, update, ctx)
    return result ?? BotResponse.ignore
  }
  return BotResponse.ignore
}

export const extractUpdate = <U extends AvailableUpdateTypes>(
  input: Update
): ExtractedUpdate<U> | undefined => {
  for (const [field, value] of Object.entries(input)) {
    if (field === "update_id") continue
    return { type: field, ...value } as ExtractedUpdate<U>
  }
  return undefined
}

export const handleUpdates = async (
  updates: Update[],
  behavior: BotBehavior,
  client: TgBotClient,
  settings: PollSettings,
  log: BotLogger,
  onHandleResult?: (result: HandleResult) => void
): Promise<BatchUpdateResult> => {
  if (behavior.type === "single") {
    return handleOneByOne(updates, behavior, client, settings, log, onHandleResult)
  }
  return handleEntireBatch(updates, behavior, log)
}

const handleEntireBatch = async (
  updates: Update[],
  handlers: HandleBatchUpdateFunction,
  log: BotLogger
): Promise<BatchUpdateResult> => {
  try {
    const doNext = await handlers.on_batch(updates)
    return { hasErrors: !doNext, updates }
  } catch (error) {
    log.warn("handle batch error", {
      errorMessage: error instanceof Error ? error.message : undefined,
      updates: updates.map((_) => Object.keys(_).at(1)),
      error
    })
    return { hasErrors: true, updates }
  }
}

const handleOneByOne = async (
  updates: Update[],
  handlers: BotUpdatesHandlers,
  client: TgBotClient,
  settings: PollSettings,
  log: BotLogger,
  onHandleResult?: (result: HandleResult) => void
): Promise<BatchUpdateResult> => {
  const results = await Promise.allSettled(
    updates.map((update) =>
      handleOneUpdate(update, handlers, client, settings, log, onHandleResult)
    )
  )

  const hasErrors = results.some(
    (r) => r.status === "rejected" || (r.status === "fulfilled" && r.value !== undefined)
  )

  if (settings.log_level === "debug") {
    log.debug("handle batch result", results)
  }

  return { hasErrors, updates }
}

const handleOneUpdate = async (
  updateObject: Update,
  handlers: BotUpdatesHandlers,
  client: TgBotClient,
  settings: PollSettings,
  log: BotLogger,
  onHandleResult?: (result: HandleResult) => void
): Promise<string | undefined> => {
  const update = extractUpdate(updateObject)

  if (!update) {
    log.warn("update handle error", {
      updateId: updateObject.update_id,
      name: "UnknownUpdate"
    })
    return "UnknownUpdate"
  }

  const handler = handlers[`on_${update.type}`] as UpdateHandler<typeof update> | undefined

  if (!handler) {
    onHandleResult?.({
      update: updateObject,
      updateType: update.type,
      status: "no_handler",
      duration: 0
    })
    return "HandlerNotDefined"
  }

  const ctx = createBotContext(update)

  const startTime = performance.now()
  let handleResult: BotResponse
  let hasError = false
  let errorMessage: string | undefined
  try {
    handleResult = await executeHandler(handler, update, ctx)
  } catch (error) {
    hasError = true
    errorMessage = error instanceof Error ? error.message : String(error)
    const errorInfo = {
      updateId: updateObject.update_id,
      updateKey: Object.keys(updateObject).at(1),
      name: "BotHandlerError",
      ...(error instanceof Error && { error: error.message })
    }
    log.warn("error", errorInfo)

    handleResult = BotResponse.make({
      type: "message",
      text: `Some internal error has happened (BotHandlerError) while handling this message`,
      message_effect_id: "💩",
      ...(updateObject.message?.message_id
        ? { reply_parameters: { message_id: updateObject.message.message_id } }
        : undefined)
    })
  }
  const duration = Math.round(performance.now() - startTime)

  if (!handleResult) {
    if (settings.log_level === "debug") {
      log.debug(`Bot response is undefined for update #${updateObject.update_id}`)
    }
    onHandleResult?.({
      update: updateObject,
      updateType: update.type,
      status: "ignored",
      duration
    })
    return undefined
  }

  if ("chat" in update && handleResult.response) {
    const responsePayload = handleResult.response
    const result = await client.executeSafe(
      `send_${responsePayload.type}` as any,
      {
        ...responsePayload,
        chat_id: update.chat.id
      } as any
    )
    if (!result.ok) {
      log.warn("failed to send response", result.error)
    } else if (settings.log_level === "debug") {
      log.debug("bot response", result.data)
    }
  }

  onHandleResult?.({
    update: updateObject,
    updateType: update.type,
    status: hasError ? "error" : handleResult.response ? "handled" : "ignored",
    ...(handleResult.response ? { responseType: handleResult.response.type } : {}),
    ...(errorMessage ? { error: errorMessage } : {}),
    duration
  })

  return undefined
}
