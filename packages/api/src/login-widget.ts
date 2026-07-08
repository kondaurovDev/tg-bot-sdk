/**
 * User data returned by Telegram Login Widget after successful authentication.
 *
 * @see https://core.telegram.org/widgets/login#receiving-authorization-data
 */
export interface TelegramLoginData {
  /** Unique Telegram user identifier */
  id: number
  /** User's first name */
  first_name: string
  /** User's last name (optional) */
  last_name?: string
  /** Telegram username (optional) */
  username?: string
  /** URL of the user's profile photo (optional) */
  photo_url?: string
  /** Unix timestamp of the authentication */
  auth_date: number
  /** HMAC-SHA-256 signature for data verification */
  hash: string
}

/**
 * Options for `Telegram.Login.auth` and `Telegram.Login.init`.
 */
export interface TelegramLoginOptions {
  /** Numeric bot ID (not the username) */
  bot_id: number
  /** Request permission to send messages to the user from your bot */
  request_access?: boolean
  /** Language code for the login popup (e.g. "en", "ru") */
  lang?: string
}

/**
 * Programmatic API exposed by `telegram-widget.js` at `window.Telegram.Login`.
 *
 * Load the script to make this available:
 * ```html
 * <script src="https://telegram.org/js/telegram-widget.js?22"></script>
 * ```
 *
 * @see https://core.telegram.org/widgets/login
 */
export interface TelegramLoginService {
  /** OAuth origin URL (`https://oauth.telegram.org`) */
  widgetsOrigin: string
  /**
   * Store options and register the auth callback.
   * If auth data is already present in the URL hash, the callback fires immediately.
   */
  init: (options: TelegramLoginOptions, callback: (data: TelegramLoginData | false) => void) => void
  /**
   * Open the login popup using options previously set by {@link init}.
   */
  open: (callback?: (data: TelegramLoginData | false) => void) => void
  /**
   * Full auth flow — opens a popup for Telegram OAuth.
   * Self-contained, does not require a prior {@link init} call.
   */
  auth: (options: TelegramLoginOptions, callback: (data: TelegramLoginData | false) => void) => void
  /**
   * Retrieve previously stored auth data from the server via POST request.
   *
   * @param options - `bot_id` is passed as a string here (server-side lookup key)
   * @param callback - receives the widget origin and auth data (or `false`)
   */
  getAuthData: (
    options: { bot_id: string; lang?: string },
    callback: (origin: string, data: TelegramLoginData | false) => void
  ) => void
}

declare global {
  interface Window {
    Telegram: {
      /** Telegram Login Widget API */
      Login: TelegramLoginService
      /** Query an embedded iframe widget for its metadata */
      getWidgetInfo: (
        el: string | HTMLElement,
        callback: (info: Record<string, unknown>) => void
      ) => void
      /** Send runtime configuration to widget iframe(s) */
      setWidgetOptions: (options: Record<string, unknown>, el?: string | HTMLElement) => void
    }
  }
}

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

/**
 * Verify the authenticity of data received from Telegram Login Widget.
 *
 * Uses the algorithm described in the
 * {@link https://core.telegram.org/widgets/login#checking-authorization | official docs}:
 * 1. Build `data_check_string` from all fields except `hash`, sorted alphabetically
 * 2. `secret_key = SHA-256(bot_token)`
 * 3. Compare `HMAC-SHA-256(secret_key, data_check_string)` with `hash`
 *
 * Uses Web Crypto API — works in Node.js, Deno, Bun, and edge runtimes.
 *
 * @param input - Auth data and bot token
 * @param input.data - Auth data received from the widget callback
 * @param input.botToken - Your bot's token from \@BotFather
 * @returns `true` if the data is authentic
 */
export const verifyLoginData = async (input: {
  data: TelegramLoginData
  botToken: string
}): Promise<boolean> => {
  const dataCheckString = Object.entries(input.data)
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")

  const encoder = new TextEncoder()

  const secretKey = await crypto.subtle.digest("SHA-256", encoder.encode(input.botToken))

  const signingKey = await crypto.subtle.importKey(
    "raw",
    secretKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign("HMAC", signingKey, encoder.encode(dataCheckString))

  return toHex(signature) === input.data.hash
}
