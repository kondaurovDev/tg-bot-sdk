/**
 * @module types
 * Core type definitions, BotResponse value class, and BotContext factory.
 * Every other module in the package depends on this one.
 */
import type { Api, Update } from "@effect-ak/tg-bot-api"
import type { TgBotClient } from "@effect-ak/tg-bot-client"

// ---------------------------------------------------------------------------
// BotResponse
// ---------------------------------------------------------------------------

/** Input parameters of a Bot API method. */
export type ApiParams<K extends keyof Api> = Parameters<Api[K]>[0]

/**
 * Shorthand for `send_*` methods: `{ type: "message", text }` maps to
 * `send_message`. `chat_id` is resolved from the incoming update.
 */
export type BotResult = {
  [K in keyof Api]: K extends `send_${infer R}`
    ? { type: R } & Omit<ApiParams<K>, "chat_id">
    : never
}[keyof Api]

/** Any Bot API method call with its full parameters. */
export type BotApiCall = {
  [K in keyof Api]: { method: K; params: ApiParams<K> }
}[keyof Api]

/** What `ctx.stream` accepts: a string (split into words), sync or async chunks. */
export type StreamSource = string | Iterable<string> | AsyncIterable<string>

export interface StreamOptions {
  /**
   * Pause between draft updates in milliseconds — it paces the animation
   * and keeps `send_message_draft` calls under control. `0` disables
   * pacing (drafts go out as fast as chunks arrive). Default: `200`.
   */
  interval_ms?: number
  /** Parse mode applied to the FINAL message; drafts stream as plain text. */
  parse_mode?: "HTML" | "MarkdownV2"
  /** Reply markup attached to the final message. */
  reply_markup?: ApiParams<"send_message">["reply_markup"]
}

/**
 * A single action the runner performs after a handler returns:
 * a `send_*` shorthand, an explicit API call, or a streamed reply
 * (`send_message_draft` per chunk, finalized with `send_message`).
 */
export type BotAction =
  | { send: BotResult }
  | { call: BotApiCall }
  | { stream: { source: StreamSource; options?: StreamOptions } }

export class BotResponse {
  readonly actions: readonly BotAction[]

  constructor(response?: BotResult | readonly BotAction[]) {
    if (response === undefined) {
      this.actions = []
    } else if (Array.isArray(response)) {
      this.actions = response
    } else {
      this.actions = [{ send: response as BotResult }]
    }
  }

  /**
   * First `send_*` shorthand of this response, if any.
   * Kept for backward compatibility — prefer {@link BotResponse.actions}.
   */
  get response(): BotResult | undefined {
    for (const action of this.actions) {
      if ("send" in action) return action.send
    }
    return undefined
  }

  /** `true` when the response performs no API calls. */
  get isEmpty(): boolean {
    return this.actions.length === 0
  }

  /** Respond with a `send_*` method; `chat_id` is taken from the update. */
  static make(result: BotResult): BotResponse {
    return new BotResponse(result)
  }

  /** Respond with an arbitrary Bot API method call. */
  static call<K extends keyof Api>(method: K, params: ApiParams<K>): BotResponse {
    return new BotResponse([{ call: { method, params } as BotApiCall }])
  }

  /** Combine several responses; their actions run sequentially in order. */
  static all(...responses: BotResponse[]): BotResponse {
    return new BotResponse(responses.flatMap((r) => r.actions))
  }

  static readonly ignore = new BotResponse()

  /** Append another response's actions after this one. */
  and(other: BotResponse): BotResponse {
    return new BotResponse([...this.actions, ...other.actions])
  }
}

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export interface HandleResult {
  update: Update
  updateType: string
  status: "handled" | "ignored" | "no_handler" | "error"
  responseType?: string
  error?: string
  duration: number
}

export interface BotLogger {
  debug: (message: string, data?: unknown) => void
  info: (message: string, data?: unknown) => void
  warn: (message: string, data?: unknown) => void
  error: (message: string, data?: unknown) => void
}

export type RunBotInput = RunBotInputSingle | RunBotInputBatch

/**
 * Where Bot API calls go: a bot token (the default HTTP client is built
 * from it) or a ready-made client — e.g. an in-memory emulator for tests
 * or the playground. When both are given, `client` wins.
 */
export type ClientSource =
  | { bot_token: string; client?: TgBotClient }
  | { client: TgBotClient; bot_token?: string }

export interface RunBotOptions {
  poll?: Partial<import("./polling").PollSettings>
  onUpdate?: (update: Update) => void
  onHandleResult?: (result: HandleResult) => void
  logger?: BotLogger
}

export type RunBotInputSingle = BotUpdatesHandlers &
  ClientSource &
  RunBotOptions & { mode: "single" }

export type RunBotInputBatch = HandleBatchUpdateFunction &
  ClientSource &
  RunBotOptions & { mode: "batch" }

export type ExtractedUpdate<K extends AvailableUpdateTypes> = {
  type: K
} & Update[K]
export type AvailableUpdateTypes = Exclude<keyof Update, "update_id">

/**
 * What a handler may return: one `BotResponse` or several — an array is
 * executed in order, exactly like `BotResponse.all(...)`.
 */
export type HandlerResult = BotResponse | readonly BotResponse[]
export type HandlerOutput = HandlerResult | PromiseLike<HandlerResult>

/** Normalize a handler's return value into a single response. */
export const toBotResponse = (result: HandlerResult): BotResponse =>
  Array.isArray(result)
    ? BotResponse.all(...(result as readonly BotResponse[]))
    : (result as BotResponse)

export type HandleUpdateFunction<U> = (payload: U) => HandlerOutput

type BotResponseParams<T extends string> = Extract<BotResult, { type: T }>

type WithoutTarget<K extends keyof Api> = Omit<
  ApiParams<K>,
  "chat_id" | "message_id" | "inline_message_id" | "callback_query_id"
>

export interface BotContext {
  readonly command: string | undefined
  readonly reply: (
    text: string,
    options?: Omit<BotResponseParams<"message">, "text" | "type">
  ) => BotResponse
  readonly replyWithDocument: (
    document: BotResponseParams<"document">["document"],
    options?: Omit<BotResponseParams<"document">, "document" | "type">
  ) => BotResponse
  readonly replyWithPhoto: (
    photo: BotResponseParams<"photo">["photo"],
    options?: Omit<BotResponseParams<"photo">, "photo" | "type">
  ) => BotResponse
  /**
   * Answer the callback query that produced this update (stops the loading
   * spinner on the tapped inline button). Only meaningful for
   * `callback_query` updates. If a `callback_query` handler responds without
   * calling this, the runner answers the query automatically with no text.
   */
  readonly answerCallbackQuery: (options?: WithoutTarget<"answer_callback_query">) => BotResponse
  /**
   * Edit the text of the message this update refers to — for a
   * `callback_query` that is the message with the tapped inline keyboard.
   */
  readonly editMessageText: (
    text: string,
    options?: Omit<WithoutTarget<"edit_message_text">, "text">
  ) => BotResponse
  /** Replace the inline keyboard of the message this update refers to. */
  readonly editMessageReplyMarkup: (
    options?: WithoutTarget<"edit_message_reply_markup">
  ) => BotResponse
  /** Delete the message this update refers to. */
  readonly deleteMessage: () => BotResponse
  /** Respond with an arbitrary Bot API method call. */
  readonly call: <K extends keyof Api>(method: K, params: ApiParams<K>) => BotResponse
  /**
   * Stream the reply the way AI bots do (Bot API 9.3+): a "Thinking…"
   * placeholder, then a `send_message_draft` per chunk (animated in
   * place), then a final `send_message` with the full text. Accepts a
   * string (split into words), an `Iterable<string>`, or an
   * `AsyncIterable<string>` — e.g. an LLM token stream.
   */
  readonly stream: (source: StreamSource, options?: StreamOptions) => BotResponse
  readonly ignore: BotResponse
}

/**
 * What every handler receives: the typed payload of the update
 * (`Message`, `CallbackQuery`, `InlineQuery`, … — never the `Update`
 * envelope) and the response helpers.
 */
export interface HandlerInput<U> {
  readonly payload: U
  readonly ctx: BotContext
}

export interface GuardedHandler<U> {
  readonly match?: (input: HandlerInput<U>) => boolean | PromiseLike<boolean>
  readonly handle: (input: HandlerInput<U>) => HandlerOutput
}

export type UpdateHandler<U> = HandleUpdateFunction<U> | GuardedHandler<U> | GuardedHandler<U>[]

export type BotUpdatesHandlers = {
  [K in AvailableUpdateTypes as `on_${K}`]?: UpdateHandler<NonNullable<Update[K]>>
}

export interface HandleBatchUpdateFunction {
  readonly on_batch: (update: Update[]) => boolean | PromiseLike<boolean>
}

export interface BotSingleBehavior extends BotUpdatesHandlers {
  type: "single"
}

export interface BotBatchBehavior extends HandleBatchUpdateFunction {
  type: "batch"
}

export type BotBehavior = BotSingleBehavior | BotBatchBehavior

// ---------------------------------------------------------------------------
// Update introspection helpers
// ---------------------------------------------------------------------------

interface UpdateWithEntities {
  text?: string
  entities?: Array<{ type: string; offset: number; length: number }>
}

const extractCommand = (update: unknown): string | undefined => {
  if (typeof update !== "object" || update === null) return undefined
  const u = update as UpdateWithEntities
  if (!u.entities || !u.text) return undefined
  const entity = u.entities.find((e) => e.type === "bot_command" && e.offset === 0)
  if (!entity) return undefined
  // In groups Telegram sends "/start@my_bot" — drop the mention so that
  // `command("/start")` matches everywhere. Commands are case-insensitive.
  const raw = u.text.slice(entity.offset, entity.offset + entity.length)
  return raw.replace(/@\S+$/, "").toLowerCase()
}

interface UpdateShape {
  id?: unknown
  chat?: { id?: number }
  message_id?: number
  message?: { chat?: { id?: number }; message_id?: number }
  inline_message_id?: string
}

const asShape = (update: unknown): UpdateShape =>
  typeof update === "object" && update !== null ? (update as UpdateShape) : {}

/**
 * Chat id a `send_*` response should go to: the update's own chat
 * (message, channel_post, …) or the chat of the message it refers to
 * (callback_query).
 */
export const resolveChatId = (update: unknown): number | undefined => {
  const u = asShape(update)
  return u.chat?.id ?? u.message?.chat?.id
}

/**
 * Target of an `edit_message_*` / `delete_message` call: the message the
 * update refers to (for callback_query) or the update's own message.
 */
export type MessageTarget = { chat_id: number; message_id: number } | { inline_message_id: string }

export const resolveMessageTarget = (update: unknown): MessageTarget | undefined => {
  const u = asShape(update)
  if (u.message?.chat?.id !== undefined && u.message.message_id !== undefined) {
    return { chat_id: u.message.chat.id, message_id: u.message.message_id }
  }
  if (u.inline_message_id !== undefined) {
    return { inline_message_id: u.inline_message_id }
  }
  if (u.chat?.id !== undefined && u.message_id !== undefined) {
    return { chat_id: u.chat.id, message_id: u.message_id }
  }
  return undefined
}

/** `callback_query.id` when the update is a callback query. */
export const resolveCallbackQueryId = (update: unknown): string | undefined => {
  const u = asShape(update)
  return typeof u.id === "string" && "chat_instance" in u ? u.id : undefined
}

// ---------------------------------------------------------------------------
// BotContext factory
// ---------------------------------------------------------------------------

export const createBotContext = (update: unknown): BotContext => {
  const command = extractCommand(update)

  const messageTarget = (method: string): MessageTarget => {
    const target = resolveMessageTarget(update)
    if (!target) {
      throw new Error(`ctx.${method}: cannot resolve target message from this update`)
    }
    return target
  }

  return {
    command,
    reply: (text, options) => BotResponse.make({ type: "message", text, ...options }),
    replyWithDocument: (document, options) =>
      BotResponse.make({ type: "document", document, ...options }),
    replyWithPhoto: (photo, options) => BotResponse.make({ type: "photo", photo, ...options }),
    answerCallbackQuery: (options) => {
      const callback_query_id = resolveCallbackQueryId(update)
      if (!callback_query_id) {
        throw new Error("ctx.answerCallbackQuery: update is not a callback_query")
      }
      return BotResponse.call("answer_callback_query", { callback_query_id, ...options })
    },
    editMessageText: (text, options) =>
      BotResponse.call("edit_message_text", {
        ...messageTarget("editMessageText"),
        text,
        ...options
      }),
    editMessageReplyMarkup: (options) =>
      BotResponse.call("edit_message_reply_markup", {
        ...messageTarget("editMessageReplyMarkup"),
        ...options
      }),
    deleteMessage: () => {
      const target = messageTarget("deleteMessage")
      if (!("chat_id" in target)) {
        throw new Error("ctx.deleteMessage: inline messages cannot be deleted")
      }
      return BotResponse.call("delete_message", target)
    },
    call: (method, params) => BotResponse.call(method, params),
    stream: (source, options) =>
      new BotResponse([{ stream: { source, ...(options ? { options } : {}) } }]),
    ignore: BotResponse.ignore
  }
}
