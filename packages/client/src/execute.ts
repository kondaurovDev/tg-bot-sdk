import type { Api } from "@effect-ak/tg-bot-api"

import type { TgClientConfig } from "./client"

// --- result ---

export type ClientErrorReason =
  | { _tag: "NotOkResponse"; errorCode?: number; details?: string }
  | { _tag: "UnexpectedResponse"; response: unknown }
  | { _tag: "ClientInternalError"; cause: unknown }
  | { _tag: "RequestTimeout"; timeoutMs: number }
  | { _tag: "UnableToGetFile"; cause: unknown }
  | { _tag: "BotHandlerError"; cause: unknown }
  | { _tag: "NotJsonResponse"; response: unknown }

export type ClientResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: ClientErrorReason }

const describeError = (reason: ClientErrorReason): string => {
  switch (reason._tag) {
    case "NotOkResponse":
      return [
        "Telegram API returned an error",
        reason.errorCode != null ? ` (${reason.errorCode})` : "",
        reason.details ? `: ${reason.details}` : ""
      ].join("")
    case "RequestTimeout":
      return `Request timed out after ${reason.timeoutMs}ms`
    case "NotJsonResponse":
      return "Telegram API returned a non-JSON response"
    case "UnexpectedResponse":
      return "Telegram API returned a response of unexpected shape"
    case "ClientInternalError":
      return "Request to Telegram API failed"
    case "UnableToGetFile":
      return "Unable to download file"
    case "BotHandlerError":
      return "Bot handler failed"
  }
}

export class TgBotClientError extends Error {
  constructor(readonly reason: ClientErrorReason) {
    super(describeError(reason), "cause" in reason ? { cause: reason.cause } : undefined)
    this.name = "TgBotClientError"
  }
}

export const unwrapClientResult = <T>(result: ClientResult<T>): T => {
  if (!result.ok) throw new TgBotClientError(result.error)
  return result.data
}

// --- guards ---

export interface FileContent {
  file_content: Uint8Array<ArrayBuffer>
  file_name: string
}

const isFileContent = (input: unknown): input is FileContent =>
  typeof input == "object" &&
  input != null &&
  "file_content" in input &&
  input.file_content instanceof Uint8Array &&
  "file_name" in input &&
  typeof input.file_name == "string"

interface TgBotApiResponseSchema {
  ok: boolean
  error_code?: number
  description?: string
  result?: unknown
}

const isTgBotApiResponse = (input: unknown): input is TgBotApiResponseSchema =>
  typeof input == "object" && input != null && "ok" in input && typeof input.ok == "boolean"

const isTimeoutError = (cause: unknown): boolean =>
  cause instanceof DOMException && cause.name === "TimeoutError"

// --- message effects ---

export const MESSAGE_EFFECTS = {
  "🔥": "5104841245755180586",
  "👍": "5107584321108051014",
  "👎": "5104858069142078462",
  "❤️": "5159385139981059251",
  "🎉": "5046509860389126442",
  "💩": "5046589136895476101"
} as const

export type MessageEffect = keyof typeof MESSAGE_EFFECTS

export const messageEffectIdCodes = Object.keys(MESSAGE_EFFECTS) as MessageEffect[]

const isMessageEffect = (input: unknown): input is MessageEffect => {
  return typeof input === "string" && input in MESSAGE_EFFECTS
}

// --- execute ---

const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

type WithMessageEffect<T> = T extends { message_effect_id?: string }
  ? Omit<T, "message_effect_id"> & { message_effect_id?: MessageEffect | (string & {}) }
  : T

export interface ExecuteOptions {
  /** Per-call timeout in milliseconds, overrides the client-level `timeout` */
  timeout?: number
  /** External abort signal, combined with the timeout signal */
  signal?: AbortSignal
}

/** Calls a Bot API method; throws {@link TgBotClientError} on failure */
export type ExecuteMethod = <M extends keyof Api>(
  method: M,
  input: WithMessageEffect<Parameters<Api[M]>[0]>,
  options?: ExecuteOptions
) => Promise<ReturnType<Api[M]>>

/** Calls a Bot API method; returns a {@link ClientResult} instead of throwing */
export type ExecuteSafeMethod = <M extends keyof Api>(
  method: M,
  input: WithMessageEffect<Parameters<Api[M]>[0]>,
  options?: ExecuteOptions
) => Promise<ClientResult<ReturnType<Api[M]>>>

export async function executeTgBotMethod<M extends keyof Api>(params: {
  config: Required<TgClientConfig>
  method: M
  input: Parameters<Api[M]>[0]
  options?: ExecuteOptions | undefined
}): Promise<ClientResult<ReturnType<Api[M]>>> {
  const { config, method, options } = params
  let { input } = params

  if ("message_effect_id" in input && isMessageEffect(input.message_effect_id)) {
    input = { ...input, message_effect_id: MESSAGE_EFFECTS[input.message_effect_id] }
  }

  const timeoutMs = options?.timeout ?? config.timeout
  const timeoutSignal = AbortSignal.timeout(timeoutMs)
  const signal = options?.signal ? AbortSignal.any([timeoutSignal, options.signal]) : timeoutSignal

  let httpResponse: Response
  try {
    httpResponse = await fetch(
      `${config.base_url}/bot${config.bot_token}/${snakeToCamel(method)}`,
      {
        body: makePayload(input) ?? null,
        method: "POST",
        signal
      }
    )
  } catch (cause) {
    if (isTimeoutError(cause)) {
      return { ok: false, error: { _tag: "RequestTimeout", timeoutMs } }
    }
    return { ok: false, error: { _tag: "ClientInternalError", cause } }
  }

  let response: unknown
  try {
    response = await httpResponse.json()
  } catch {
    return { ok: false, error: { _tag: "NotJsonResponse", response: httpResponse } }
  }

  if (!isTgBotApiResponse(response)) {
    return { ok: false, error: { _tag: "UnexpectedResponse", response } }
  }

  if (!httpResponse.ok || !response.ok) {
    return {
      ok: false,
      error: {
        _tag: "NotOkResponse",
        ...(response.error_code ? { errorCode: response.error_code } : {}),
        ...(response.description ? { details: response.description } : {})
      }
    }
  }

  return { ok: true, data: response.result as ReturnType<Api[M]> }
}

export const makePayload = (body: object): FormData | undefined => {
  const entries = Object.entries(body)

  if (entries.length == 0) return undefined

  const result = new FormData()

  for (const [key, value] of entries) {
    if (value == null) continue

    if (typeof value != "object") {
      result.append(key, `${value}`)
    } else if (value instanceof Blob) {
      result.append(key, value)
    } else if (isFileContent(value)) {
      result.append(key, new Blob([value.file_content]), value.file_name)
    } else {
      result.append(key, JSON.stringify(value))
    }
  }

  return result
}
