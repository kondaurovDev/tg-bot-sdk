import {
  executeTgBotMethod,
  unwrapClientResult,
  type ClientResult,
  type ExecuteMethod,
  type ExecuteSafeMethod
} from "./execute"

const TG_BOT_API_URL = "https://api.telegram.org"
const DEFAULT_TIMEOUT_MS = 60_000

export interface TgClientConfig {
  bot_token: string
  base_url?: string
  /** Request timeout in milliseconds, overridable per call. Default: 60_000 */
  timeout?: number
}

export interface GetFileInput {
  fileId: string
  type?: string
}

export interface TgFile {
  readonly content: ArrayBuffer
  readonly file_name: string
  readonly base64String: () => string
  readonly file: () => File
}

export interface TgBotClient {
  readonly config: Required<TgClientConfig>
  /** Calls a Bot API method; throws `TgBotClientError` on failure */
  readonly execute: ExecuteMethod
  /** Calls a Bot API method; returns a `ClientResult` instead of throwing */
  readonly executeSafe: ExecuteSafeMethod
  /** Downloads a file by its id; throws `TgBotClientError` on failure */
  readonly getFile: (input: GetFileInput) => Promise<TgFile>
  /** Downloads a file by its id; returns a `ClientResult` instead of throwing */
  readonly getFileSafe: (input: GetFileInput) => Promise<ClientResult<TgFile>>
}

export function makeTgBotClient(config: TgClientConfig): TgBotClient {
  const tgConfig = {
    bot_token: config.bot_token,
    base_url: config.base_url ?? TG_BOT_API_URL,
    timeout: config.timeout ?? DEFAULT_TIMEOUT_MS
  }

  const executeSafe: ExecuteSafeMethod = (method, input, options) =>
    executeTgBotMethod({
      config: tgConfig,
      method,
      input: input as any,
      options
    })

  const execute: ExecuteMethod = (method, input, options) =>
    executeSafe(method, input, options).then(unwrapClientResult)

  const getFileSafe = async (params: GetFileInput): Promise<ClientResult<TgFile>> => {
    const response = await executeSafe("get_file", { file_id: params.fileId })

    if (!response.ok) return response

    const file_path = response.data.file_path

    if (!file_path || file_path.length === 0) {
      return {
        ok: false,
        error: { _tag: "UnableToGetFile", cause: "File path not defined" }
      }
    }

    const file_name = file_path.replaceAll("/", "-")
    const url = `${tgConfig.base_url}/file/bot${tgConfig.bot_token}/${file_path}`

    let content: ArrayBuffer
    try {
      content = await fetch(url, {
        signal: AbortSignal.timeout(tgConfig.timeout)
      }).then((_) => _.arrayBuffer())
    } catch (cause) {
      return { ok: false, error: { _tag: "UnableToGetFile", cause } }
    }

    const base64String = () => Buffer.from(content).toString("base64")
    const file = () =>
      new File([content], file_name, params.type ? { type: params.type } : undefined)

    return {
      ok: true,
      data: { content, file_name, base64String, file }
    }
  }

  const getFile = (params: GetFileInput): Promise<TgFile> =>
    getFileSafe(params).then(unwrapClientResult)

  return {
    config: tgConfig,
    execute,
    executeSafe,
    getFile,
    getFileSafe
  }
}
