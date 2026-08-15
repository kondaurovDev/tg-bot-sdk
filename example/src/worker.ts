/**
 * Live demo of @effect-ak/tg-bot on Cloudflare Workers.
 *
 * One Telegram bot account, several demo bots inside. The home bot
 * (`bots/home.ts`) handles /start, /source, /install, /features and the /demo
 * menu; every other update is routed to the demo the chat picked. The choice
 * is stored in KV per chat.
 *
 * Routes:
 *   POST /webhook — Telegram updates (secret token verified)
 *   GET  /setup   — registers the webhook once (protected by the same secret)
 *   GET  /        — health check
 */
import { extractUpdate, SECRET_TOKEN_HEADER } from "@effect-ak/tg-bot"
import { makeTgBotClient } from "@effect-ak/tg-bot-client"
import type { WebhookHandler } from "@effect-ak/tg-bot"
import type { Update } from "@effect-ak/tg-bot-api"

import { makeHomeBot, isHomeUpdate, HOME_COMMAND_LIST, SOURCE_URL } from "./bots/home"
import type { ModeStore } from "./bots/home"
import { demos, DEFAULT_DEMO } from "./bots/registry"

// --- env ---------------------------------------------------------------------

interface KVNamespace {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
}

interface Env {
  BOT_TOKEN: string
  WEBHOOK_SECRET: string
  STATE: KVNamespace
}

// --- runtime (built once per isolate) ---------------------------------------

interface Runtime {
  store: ModeStore
  home: WebhookHandler
  handlers: Record<string, WebhookHandler>
}

let runtime: Runtime | undefined

const MODE_TTL_SECONDS = 30 * 24 * 60 * 60

const buildRuntime = (env: Env): Runtime => {
  const webhookConfig = { bot_token: env.BOT_TOKEN, secret_token: env.WEBHOOK_SECRET }

  // Active demo per chat. Entries expire after 30 days of inactivity so the
  // namespace does not accumulate stale chats; the default demo kicks in then.
  const store: ModeStore = {
    get: (chatId) => env.STATE.get(`chat:${chatId}`),
    set: (chatId, mode) =>
      env.STATE.put(`chat:${chatId}`, mode, { expirationTtl: MODE_TTL_SECONDS })
  }

  const home = makeHomeBot(store).webhook(webhookConfig)
  const handlers = Object.fromEntries(
    Object.entries(demos).map(([id, d]) => [id, d.bot.webhook(webhookConfig)])
  )

  return { store, home, handlers }
}

// --- routing -----------------------------------------------------------------

const chatIdOf = (update: Update): number | undefined => {
  const u = extractUpdate(update) as { chat?: { id: number }; message?: { chat: { id: number } } }
  return u?.chat?.id ?? u?.message?.chat.id
}

const dispatch = async (update: Update, rt: Runtime): Promise<void> => {
  if (isHomeUpdate(update)) return rt.home.handleUpdate(update)
  const chatId = chatIdOf(update)
  const active = chatId !== undefined ? await rt.store.get(chatId) : null
  const handler = rt.handlers[active ?? DEFAULT_DEMO] ?? rt.handlers[DEFAULT_DEMO]!
  return handler.handleUpdate(update)
}

// --- worker ------------------------------------------------------------------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    runtime ??= buildRuntime(env)
    const url = new URL(request.url)

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(`tg-bot-sdk demo is running. Source: ${SOURCE_URL}`)
    }

    if (request.method === "GET" && url.pathname === "/setup") {
      if (request.headers.get(SECRET_TOKEN_HEADER) !== env.WEBHOOK_SECRET) {
        return new Response("forbidden", { status: 403 })
      }
      // Behind a local tunnel the worker sees plain http; Telegram requires https.
      const webhookUrl = `https://${url.host}/webhook`
      try {
        await runtime.home.setWebhook({
          url: webhookUrl,
          allowed_updates: ["message", "callback_query"],
          drop_pending_updates: true
        })
        // Show the home commands in the client's "/" menu
        await makeTgBotClient({ bot_token: env.BOT_TOKEN }).execute("set_my_commands", {
          commands: HOME_COMMAND_LIST
        })
        return new Response(`webhook registered: ${webhookUrl}`)
      } catch (error) {
        console.error("set_webhook failed", error)
        const message = error instanceof Error ? error.message : String(error)
        return new Response(`set_webhook failed: ${message}`, { status: 500 })
      }
    }

    if (request.method === "POST" && url.pathname === "/webhook") {
      if (request.headers.get(SECRET_TOKEN_HEADER) !== env.WEBHOOK_SECRET) {
        return new Response("forbidden", { status: 403 })
      }
      try {
        const update = (await request.json()) as Update
        await dispatch(update, runtime)
        return new Response("ok")
      } catch (error) {
        console.error("webhook error", error)
        return new Response("error", { status: 500 })
      }
    }

    return new Response("not found", { status: 404 })
  }
}
