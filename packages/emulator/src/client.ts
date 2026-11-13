/**
 * @module client
 * The `TgBotClient` facade over the method table: dispatch, error
 * mapping, and file downloads backed by the upload store.
 */
import type { Api } from "@effect-ak/tg-bot-api"
import {
  unwrapClientResult,
  type ClientResult,
  type ExecuteMethod,
  type ExecuteSafeMethod,
  type GetFileInput,
  type MethodInput,
  type TgBotClient,
  type TgFile
} from "@effect-ak/tg-bot-client"

import { EmulatorApiError } from "./errors"
import type { EmulatorState } from "./state"

type MethodResult<M extends keyof Api> = ReturnType<Api[M]>

/**
 * The Bot API methods the emulator implements. Each handler is checked
 * against the generated signature of its method: it takes what the client
 * accepts for it and returns what the real method returns.
 */
export type MethodTable = {
  [M in keyof Api]?: (input: MethodInput<M>) => MethodResult<M> | PromiseLike<MethodResult<M>>
}

const toFailure = (cause: unknown): ClientResult<never> =>
  cause instanceof EmulatorApiError
    ? { ok: false, error: { _tag: "NotOkResponse", errorCode: cause.code, details: cause.message } }
    : { ok: false, error: { _tag: "ClientInternalError", cause } }

/** Base64 of raw bytes without `Buffer`: the same code runs in Node, browsers and Workers. */
const toBase64 = (bytes: Uint8Array): string => {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export const makeEmulatorClient = (state: EmulatorState, methods: MethodTable): TgBotClient => {
  const executeSafe: ExecuteSafeMethod = <M extends keyof Api>(
    method: M,
    input: MethodInput<M>
  ): Promise<ClientResult<MethodResult<M>>> => {
    const handler = methods[method]
    if (!handler) {
      return Promise.resolve({
        ok: false,
        error: {
          _tag: "NotOkResponse",
          errorCode: 404,
          details: `Method ${method} is not supported by the emulator`
        }
      })
    }
    // The executor turns a handler that throws into a rejection, and `then`
    // (unlike `await`) hands the result back as the method's own return type.
    return new Promise<MethodResult<M>>((resolve) => resolve(handler(input))).then(
      (data) => ({ ok: true, data }),
      toFailure
    )
  }

  const execute: ExecuteMethod = (method, input) =>
    executeSafe(method, input).then(unwrapClientResult)

  const getFileSafe = async (input: GetFileInput): Promise<ClientResult<TgFile>> => {
    const upload = state.uploads.get(input.fileId)
    if (!upload) {
      return {
        ok: false,
        error: { _tag: "UnableToGetFile", cause: "File not found in the emulator" }
      }
    }
    const bytes = upload.content
    const content = bytes.slice().buffer
    return {
      ok: true,
      data: {
        content,
        file_name: upload.file_name,
        base64String: () => toBase64(bytes),
        file: () =>
          new File([content], upload.file_name, input.type ? { type: input.type } : undefined)
      }
    }
  }

  return {
    config: { bot_token: "emulator", base_url: "emulator://", timeout: 60_000 },
    executeSafe,
    execute,
    getFileSafe,
    getFile: (input) => getFileSafe(input).then(unwrapClientResult)
  }
}
