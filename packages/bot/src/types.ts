/**
 * @module types
 * Core type definitions, BotResponse value class, and BotContext factory.
 * Every other module in the package depends on this one.
 */
import type { Api, Update } from "@effect-ak/tg-bot-api"
import type { ClientErrorReason, MethodInput, TgBotClient } from "@effect-ak/tg-bot-client"

import type { PollSettings } from "./polling"

/** `Array.isArray` that keeps the element type of a readonly array. */
export const isReadonlyArray: (value: unknown) => value is readonly unknown[] = Array.isArray

// ---------------------------------------------------------------------------
// BotResponse
// ---------------------------------------------------------------------------

/**
 * Input parameters of a Bot API method, as the client accepts them
 * (`message_effect_id` also takes an emoji).
 */
export type ApiParams<K extends keyof Api> = MethodInput<K>

/**
 * Shorthand for `send_*` methods: `{ type: "message", text }` maps to
 * `send_message`. `chat_id` is resolved from the incoming update.
 *
 * `type` names the method and is not sent. A method with a `type` parameter
 * of its own (`send_poll`: `"quiz" | "regular"`) cannot set it through the
 * shorthand — use `ctx.call("send_poll", { … })`.
 */
export type BotResult = {
  [K in keyof Api]: K extends `send_${infer R}`
    ? { type: R } & Omit<ApiParams<K>, "chat_id" | "type">
    : never
}[keyof Api]

/**
 * A Bot API method call with its full parameters: any method by default,
 * or the one(s) named by `K`.
 */
export type BotApiCall<K extends keyof Api = keyof Api> = {
  [P in K]: { method: P; params: ApiParams<P> }
}[K]

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
 * a `send_*` shorthand, an explicit API call, a streamed reply
 * (`send_message_draft` per chunk, finalized with `send_message`), or
 * actions with a fallback for when one of their calls fails (`orElse`).
 */
export type BotAction =
  | { send: BotResult }
  | { call: BotApiCall }
  | { stream: { source: StreamSource; options?: StreamOptions } }
  | {
      attempt: {
        actions: readonly BotAction[]
        fallback: (error: ClientErrorReason) => BotResponse
      }
    }

export class BotResponse {
  readonly actions: readonly BotAction[]

  constructor(response?: BotResult | readonly BotAction[]) {
    if (response === undefined) {
      this.actions = []
    } else if (isReadonlyArray(response)) {
      this.actions = response
    } else {
      this.actions = [{ send: response }]
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
    const call: BotApiCall<K> = { method, params }
    // A call to one method is a member of the union over all of them, but
    // TypeScript cannot widen the generic form to that union by itself.
    // oxlint-disable-next-line typescript/consistent-type-assertions
    return new BotResponse([{ call: call as BotApiCall }])
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

  /**
   * What to do when Telegram refuses one of this response's calls: the rest
   * of this response is skipped and the fallback runs instead, given the
   * error. Without `orElse` a failed call is only logged — the user sees
   * nothing.
   *
   * `BotResponse.make({ type: "widget", html }).orElse((error) => ctx.reply("No widget: " + error._tag))`
   */
  orElse(fallback: BotResponse | ((error: ClientErrorReason) => BotResponse)): BotResponse {
    if (this.isEmpty) return this
    const handle = typeof fallback === "function" ? fallback : () => fallback
    return new BotResponse([{ attempt: { actions: this.actions, fallback: handle } }])
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
  poll?: Partial<PollSettings>
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

/** Update kinds: every field of `Update` except `update_id`. */
export type AvailableUpdateTypes = Exclude<keyof Update, "update_id">

/** Payload of an update kind: `Message` for `message`, `CallbackQuery` for `callback_query`, … */
export type UpdatePayload<K extends AvailableUpdateTypes = AvailableUpdateTypes> = NonNullable<
  Update[K]
>

/**
 * An update split into its kind and its payload. The payload is the object
 * Telegram sent, untouched — the kind lives beside it, never inside it
 * (`Poll` and `WidgetQuery` have a `type` field of their own).
 */
export type ExtractedUpdate<K extends AvailableUpdateTypes = AvailableUpdateTypes> = {
  [T in K]: { readonly type: T; readonly payload: UpdatePayload<T> }
}[K]

/**
 * What a handler may return: one `BotResponse` or several — an array is
 * executed in order, exactly like `BotResponse.all(...)`.
 */
export type HandlerResult = BotResponse | readonly BotResponse[]
export type HandlerOutput = HandlerResult | PromiseLike<HandlerResult>

/** Normalize a handler's return value into a single response. */
export const toBotResponse = (result: HandlerResult): BotResponse =>
  isReadonlyArray(result) ? BotResponse.all(...result) : result

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
  /**
   * Answer the widget request that produced this update (`widget_query` or
   * `shared_widget_query`, Bot API 10.4). `data` (up to 1024 bytes) reaches
   * only the widget that asked. If a widget handler responds without calling
   * this, the runner answers the request automatically with no data, so the
   * widget does not end in `TIMEOUT`.
   */
  readonly answerWidgetQuery: (data?: string) => BotResponse
  /**
   * Change the state of the widget this update came from (`widget_query`):
   * `chat_data` is the message's own state, `public_data` the state seen
   * wherever the widget is shown. An empty string removes a value.
   */
  readonly editWidgetData: (options: WithoutTarget<"edit_message_widget_data">) => BotResponse
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
  [K in AvailableUpdateTypes as `on_${K}`]?: UpdateHandler<UpdatePayload<K>>
}

/** Handlers keyed by update kind — `BotUpdatesHandlers` without the `on_` prefix. */
export type UpdateHandlerTable<K extends AvailableUpdateTypes = AvailableUpdateTypes> = {
  [P in K]?: UpdateHandler<UpdatePayload<P>>
}

// The two functions below are the only place that knows `on_<kind>` belongs to
// `<kind>`: TypeScript cannot follow a generic key through the prefix, so each
// carries one assertion. Everything else works on typed kinds.

/** The handler registered for an update kind, if any. */
export const handlerFor = <K extends AvailableUpdateTypes>(
  handlers: BotUpdatesHandlers,
  type: K
): UpdateHandler<UpdatePayload<K>> | undefined =>
  // oxlint-disable-next-line typescript/consistent-type-assertions
  handlers[`on_${type}`] as UpdateHandler<UpdatePayload<K>> | undefined

/** Kind-keyed handlers in the public `on_*` form. */
export const toUpdatesHandlers = (table: UpdateHandlerTable): BotUpdatesHandlers =>
  // oxlint-disable-next-line typescript/consistent-type-assertions
  Object.fromEntries(
    Object.entries(table).map(([type, handler]) => [`on_${type}`, handler])
  ) as BotUpdatesHandlers

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

// These look at the fields a payload has, not at a table of update kinds, so
// an update kind added by a newer Bot API version resolves without a change
// here. The `in` checks narrow the payload union to the types that declare
// the field; the compiler then checks every one of them.

const extractCommand = (payload: UpdatePayload): string | undefined => {
  if (!("text" in payload && "entities" in payload)) return undefined
  const { text, entities } = payload
  if (!text || !entities) return undefined
  const entity = entities.find((e) => e.type === "bot_command" && e.offset === 0)
  if (!entity) return undefined
  // In groups Telegram sends "/start@my_bot" — drop the mention so that
  // `command("/start")` matches everywhere. Commands are case-insensitive.
  const raw = text.slice(entity.offset, entity.offset + entity.length)
  return raw.replace(/@\S+$/, "").toLowerCase()
}

/**
 * Chat id a `send_*` response should go to: the payload's own chat
 * (message, channel_post, …) or the chat of the message it refers to
 * (callback_query).
 */
export const resolveChatId = (payload: UpdatePayload): number | undefined => {
  if ("chat" in payload && payload.chat) return payload.chat.id
  if ("message" in payload && payload.message) return payload.message.chat.id
  return undefined
}

/**
 * Target of an `edit_message_*` / `delete_message` call: the message the
 * payload refers to (for callback_query) or the payload's own message.
 */
export type MessageTarget = { chat_id: number; message_id: number } | { inline_message_id: string }

export const resolveMessageTarget = (payload: UpdatePayload): MessageTarget | undefined => {
  if ("message" in payload && payload.message) {
    return { chat_id: payload.message.chat.id, message_id: payload.message.message_id }
  }
  if ("inline_message_id" in payload && payload.inline_message_id !== undefined) {
    return { inline_message_id: payload.inline_message_id }
  }
  if (
    "chat" in payload &&
    "message_id" in payload &&
    payload.chat &&
    payload.message_id !== undefined
  ) {
    return { chat_id: payload.chat.id, message_id: payload.message_id }
  }
  return undefined
}

/** `callback_query.id` when the update is a callback query. */
export const resolveCallbackQueryId = (update: ExtractedUpdate): string | undefined =>
  update.type === "callback_query" ? update.payload.id : undefined

/** The query id when the update is a request from a widget. */
export const resolveWidgetQueryId = (update: ExtractedUpdate): string | undefined =>
  update.type === "widget_query" || update.type === "shared_widget_query"
    ? update.payload.id
    : undefined

// ---------------------------------------------------------------------------
// BotContext factory
// ---------------------------------------------------------------------------

export const createBotContext = (update: ExtractedUpdate): BotContext => {
  const command = extractCommand(update.payload)

  const messageTarget = (method: string): MessageTarget => {
    const target = resolveMessageTarget(update.payload)
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
    answerWidgetQuery: (data) => {
      const widget_query_id = resolveWidgetQueryId(update)
      if (!widget_query_id) {
        throw new Error(
          "ctx.answerWidgetQuery: update is not a widget_query or shared_widget_query"
        )
      }
      return BotResponse.call("answer_widget_query", {
        widget_query_id,
        ...(data !== undefined ? { data } : {})
      })
    },
    editWidgetData: (options) =>
      BotResponse.call("edit_message_widget_data", {
        ...messageTarget("editWidgetData"),
        ...options
      }),
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
