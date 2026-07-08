/**
 * @module types
 * Core type definitions, BotResponse value class, and BotContext factory.
 * Every other module in the package depends on this one.
 */
import type { Api, Update } from "@effect-ak/tg-bot-api"

// ---------------------------------------------------------------------------
// BotResponse
// ---------------------------------------------------------------------------

type BotResult = {
  [K in keyof Api]: K extends `send_${infer R}`
    ? { type: R } & Omit<Parameters<Api[K]>[0], "chat_id">
    : never
}[keyof Api]

export class BotResponse {
  readonly response: BotResult | undefined

  constructor(response?: BotResult) {
    this.response = response
  }

  static make(result: BotResult): BotResponse {
    return new BotResponse(result)
  }

  static readonly ignore = new BotResponse()
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

export interface RunBotInputSingle extends BotUpdatesHandlers {
  bot_token: string
  mode: "single"
  poll?: Partial<import("./polling").PollSettings>
  onUpdate?: (update: Update) => void
  onHandleResult?: (result: HandleResult) => void
  logger?: BotLogger
}

export interface RunBotInputBatch extends HandleBatchUpdateFunction {
  bot_token: string
  mode: "batch"
  poll?: Partial<import("./polling").PollSettings>
  onUpdate?: (update: Update) => void
  onHandleResult?: (result: HandleResult) => void
  logger?: BotLogger
}

export type ExtractedUpdate<K extends AvailableUpdateTypes> = {
  type: K
} & Update[K]
export type AvailableUpdateTypes = Exclude<keyof Update, "update_id">

export type HandleUpdateFunction<U> = (update: U) => BotResponse | PromiseLike<BotResponse>

type BotResponseParams<T extends string> = Extract<
  Parameters<typeof BotResponse.make>[0],
  { type: T }
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
  readonly ignore: BotResponse
}

export interface HandlerInput<U> {
  readonly update: U
  readonly ctx: BotContext
}

export interface GuardedHandler<U> {
  readonly match?: (input: HandlerInput<U>) => boolean | PromiseLike<boolean>
  readonly handle: (input: HandlerInput<U>) => BotResponse | PromiseLike<BotResponse>
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
// BotContext factory
// ---------------------------------------------------------------------------

interface UpdateWithEntities {
  text?: string
  entities?: Array<{ type: string; offset: number; length: number }>
}

const extractCommand = (update: unknown): string | undefined => {
  if (typeof update !== "object" || update === null) return undefined
  const u = update as UpdateWithEntities
  if (!u.entities || !u.text) return undefined
  const entity = u.entities.find((e) => e.type === "bot_command")
  if (!entity) return undefined
  return u.text.slice(entity.offset, entity.offset + entity.length)
}

export const createBotContext = (update: unknown): BotContext => {
  const command = extractCommand(update)

  return {
    command,
    reply: (text, options) => BotResponse.make({ type: "message", text, ...options }),
    replyWithDocument: (document, options) =>
      BotResponse.make({ type: "document", document, ...options }),
    replyWithPhoto: (photo, options) => BotResponse.make({ type: "photo", photo, ...options }),
    ignore: BotResponse.ignore
  }
}
