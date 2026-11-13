/**
 * @module telegram
 * The few Bot API calls real mode makes from the page before the bot
 * runs: who the bot is, whether a webhook is set, deleting it. Responses
 * are checked at runtime: the page trusts nothing it parses.
 */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const call = async (token: string, method: string): Promise<unknown> => {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`)
  const body: unknown = await response.json()
  if (!isRecord(body) || body["ok"] !== true) return undefined
  return body["result"]
}

/** The bot's username (or first name); `undefined` for a token Telegram rejects. */
export const getBotName = async (token: string): Promise<string | undefined> => {
  const me = await call(token, "getMe")
  if (!isRecord(me)) return undefined
  const name = me["username"] ?? me["first_name"]
  return typeof name === "string" ? name : undefined
}

export interface WebhookInfo {
  url: string
  pending: number
  lastError?: string
}

/** The webhook set on the bot, if one is. */
export const getWebhook = async (token: string): Promise<WebhookInfo | undefined> => {
  const info = await call(token, "getWebhookInfo")
  if (!isRecord(info) || typeof info["url"] !== "string" || info["url"] === "") return undefined
  const pending = info["pending_update_count"]
  const lastError = info["last_error_message"]
  return {
    url: info["url"],
    pending: typeof pending === "number" ? pending : 0,
    ...(typeof lastError === "string" ? { lastError } : {})
  }
}

export const deleteWebhook = async (token: string): Promise<boolean> =>
  (await call(token, "deleteWebhook")) === true
