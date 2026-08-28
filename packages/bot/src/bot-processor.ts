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
  BotBehavior,
  BotAction
} from "./types"
import {
  createBotContext,
  BotResponse,
  resolveChatId,
  resolveCallbackQueryId,
  toBotResponse
} from "./types"
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
  const input = { payload: update, ctx }
  if (guard.match) {
    const matched = await guard.match(input)
    if (!matched) return null
  }
  return toBotResponse(await guard.handle(input))
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
    return toBotResponse(await handler(update))
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

  const actions = withAutoCallbackAnswer(update, handleResult)

  for (const action of actions) {
    await executeAction(action, update, client, settings, log)
  }

  const responseType = describeResponseType(handleResult)

  onHandleResult?.({
    update: updateObject,
    updateType: update.type,
    status: hasError ? "error" : handleResult.isEmpty ? "ignored" : "handled",
    ...(responseType ? { responseType } : {}),
    ...(errorMessage ? { error: errorMessage } : {}),
    duration
  })

  return undefined
}

/**
 * A `callback_query` must be answered or the tapped button keeps spinning.
 * When a handler responds to a callback query without an explicit
 * `answer_callback_query`, prepend one with no text.
 */
const withAutoCallbackAnswer = (
  update: ExtractedUpdate<AvailableUpdateTypes>,
  response: BotResponse
): readonly BotAction[] => {
  if (update.type !== "callback_query" || response.isEmpty) return response.actions
  const alreadyAnswered = response.actions.some(
    (a) => "call" in a && a.call.method === "answer_callback_query"
  )
  if (alreadyAnswered) return response.actions
  const callback_query_id = resolveCallbackQueryId(update)
  if (!callback_query_id) return response.actions
  return [
    { call: { method: "answer_callback_query", params: { callback_query_id } } },
    ...response.actions
  ]
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Draft ids must be non-zero; reusing one animates the update in place,
// so each stream gets its own id.
let nextStreamDraftId = 1

/**
 * Execute a `ctx.stream` action: "Thinking…" placeholder, a
 * `send_message_draft` per chunk (paced by `interval_ms`), then the
 * final `send_message` with the accumulated text.
 */
const executeStream = async (
  stream: Extract<BotAction, { stream: unknown }>["stream"],
  update: ExtractedUpdate<AvailableUpdateTypes>,
  client: TgBotClient,
  log: BotLogger
): Promise<void> => {
  const chat_id = resolveChatId(update)
  if (chat_id === undefined) {
    log.warn("cannot stream response: update has no chat", { updateType: update.type })
    return
  }
  const { source, options } = stream
  const interval = options?.interval_ms ?? 200
  const draft_id = nextStreamDraftId++
  const chunks = typeof source === "string" ? source.split(/(?<=\s)/) : source

  // Show "Thinking…" while the first chunk is on its way. Draft failures
  // are not fatal: against a Bot API without drafts the final message
  // still goes out.
  let buffer = ""
  await client.executeSafe("send_message_draft", { chat_id, draft_id })
  try {
    for await (const chunk of chunks) {
      buffer += chunk
      await client.executeSafe("send_message_draft", { chat_id, draft_id, text: buffer })
      if (interval > 0) await delay(interval)
    }
  } catch (error) {
    log.warn("stream source failed", error instanceof Error ? error.message : error)
  }

  if (buffer.length === 0) return
  const result = await client.executeSafe("send_message", {
    chat_id,
    text: buffer,
    ...(options?.parse_mode ? { parse_mode: options.parse_mode } : {}),
    ...(options?.reply_markup ? { reply_markup: options.reply_markup } : {})
  })
  if (!result.ok) {
    log.warn("failed to finalize stream", result.error)
  }
}

const executeAction = async (
  action: BotAction,
  update: ExtractedUpdate<AvailableUpdateTypes>,
  client: TgBotClient,
  settings: PollSettings,
  log: BotLogger
): Promise<void> => {
  let method: string
  let params: unknown

  if ("stream" in action) {
    await executeStream(action.stream, update, client, log)
    return
  }

  if ("send" in action) {
    const chat_id = resolveChatId(update)
    if (chat_id === undefined) {
      log.warn("cannot send response: update has no chat", { updateType: update.type })
      return
    }
    method = `send_${action.send.type}`
    params = { ...action.send, chat_id }
  } else {
    method = action.call.method
    params = action.call.params
  }

  const result = await client.executeSafe(method as any, params as any)
  if (!result.ok) {
    log.warn(`failed to execute ${method}`, result.error)
  } else if (settings.log_level === "debug") {
    log.debug(`bot response (${method})`, result.data)
  }
}

const describeResponseType = (response: BotResponse): string | undefined => {
  const first = response.actions[0]
  if (!first) return undefined
  if ("stream" in first) return "stream"
  return "send" in first ? first.send.type : first.call.method
}
