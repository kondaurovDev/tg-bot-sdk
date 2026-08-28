/**
 * @module client
 * The `TgBotClient` facade over the method table: dispatch, error
 * mapping, and file downloads backed by the upload store.
 */
import {
  unwrapClientResult,
  type ClientResult,
  type GetFileInput,
  type TgBotClient,
  type TgFile
} from "@effect-ak/tg-bot-client"

import { EmulatorApiError } from "./errors"
import type { EmulatorState } from "./state"

export type MethodTable = Record<string, (input: any) => unknown>

const toBase64 = (bytes: Uint8Array): string => {
  if (typeof btoa === "function") {
    let binary = ""
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary)
  }
  return Buffer.from(bytes).toString("base64")
}

export const makeEmulatorClient = (state: EmulatorState, methods: MethodTable): TgBotClient => {
  const executeSafe = async (method: string, input: unknown): Promise<ClientResult<unknown>> => {
    const handler = methods[method]
    if (!handler) {
      return {
        ok: false,
        error: {
          _tag: "NotOkResponse",
          errorCode: 404,
          details: `Method ${method} is not supported by the emulator`
        }
      }
    }
    try {
      return { ok: true, data: await handler(input ?? {}) }
    } catch (cause) {
      if (cause instanceof EmulatorApiError) {
        return {
          ok: false,
          error: { _tag: "NotOkResponse", errorCode: cause.code, details: cause.message }
        }
      }
      return { ok: false, error: { _tag: "ClientInternalError", cause } }
    }
  }

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
    executeSafe: executeSafe as TgBotClient["executeSafe"],
    execute: ((method, input) =>
      executeSafe(method, input).then(unwrapClientResult)) as TgBotClient["execute"],
    getFileSafe,
    getFile: (input) => getFileSafe(input).then(unwrapClientResult)
  }
}
