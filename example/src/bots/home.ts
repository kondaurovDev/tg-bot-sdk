/**
 * Home bot: what you talk to when no demo is active. Describes the library
 * (/start, /source, /install, /features) and lets you switch the active demo
 * (/demo + inline buttons). The active demo is stored per chat via `ModeStore`
 * — KV on Cloudflare, an in-memory Map for local polling.
 */
import { createBot } from "@effect-ak/tg-bot"
import type { BotContext } from "@effect-ak/tg-bot"
import type { Update } from "@effect-ak/tg-bot-api"

import { demos, DEFAULT_DEMO } from "./registry"

export interface ModeStore {
  get(chatId: number): Promise<string | null>
  set(chatId: number, mode: string): Promise<void>
}

export const GITHUB_URL = "https://github.com/kondaurovDev/tg-bot-sdk"
export const NPM_URL = "https://www.npmjs.com/package/@effect-ak/tg-bot"
export const DOCS_URL = "https://tg-bot-sdk.website"
export const SOURCE_URL = `${GITHUB_URL}/tree/main/example`

/** Commands handled by the home bot regardless of the active demo (also registered via set_my_commands). */
export const HOME_COMMAND_LIST = [
  { command: "demo", description: "Choose the active demo bot" },
  { command: "start", description: "About this bot" },
  { command: "source", description: "GitHub repository" },
  { command: "install", description: "Quick start" },
  { command: "features", description: "Library features" }
]
export const HOME_COMMANDS = HOME_COMMAND_LIST.map((c) => `/${c.command}`)
export const HOME_CALLBACK_PREFIX = "demo:"
/** Text of the persistent reply-keyboard button that reopens the demo menu. */
const SWITCH_BUTTON_PREFIX = "🔀 "

export const isHomeUpdate = (update: Update): boolean => {
  const msg = update.message
  const entity = msg?.entities?.find((e) => e.type === "bot_command")
  if (entity && msg?.text) {
    const cmd = msg.text.slice(entity.offset, entity.offset + entity.length)
    if (HOME_COMMANDS.includes(cmd)) return true
  }
  if (msg?.text?.startsWith(SWITCH_BUTTON_PREFIX)) return true
  return update.callback_query?.data?.startsWith(HOME_CALLBACK_PREFIX) ?? false
}

// --- texts -------------------------------------------------------------------

const startMessage = `
Welcome! I'm the demo bot for <b>@effect-ak/tg-bot</b> — a type-safe Telegram bot SDK for TypeScript.

I run on Cloudflare Workers via webhooks. Several demo bots live inside me; pick one with /demo and just talk to it.

Commands:
/demo — choose the active demo
/source — GitHub repository
/install — quick start
/features — library features
`.trim()

const installMessage = `
Quick Start:

<code>npm install @effect-ak/tg-bot</code>

<pre language="typescript">import { createBot } from "@effect-ak/tg-bot"
import type { BotContext } from "@effect-ak/tg-bot"

const handler = createBot()
  .onMessage(({ command }) =&gt; [
    command("/start", ({ ctx }) =&gt; ctx.reply("Hello!"))
  ])
  .webhook({ bot_token: BOT_TOKEN, secret_token: WEBHOOK_SECRET })

export default { fetch: handler }</pre>

Docs: ${DOCS_URL}
`.trim()

const featuresMessage = `
Features:

• Fluent builder API with typed helpers
• Full Bot API type coverage, generated from the official docs
• Long polling and webhooks (with secret token verification)
• Inline keyboards: edit messages in place, answer callback queries
• Zero runtime dependencies, native fetch

GitHub: ${GITHUB_URL}
npm: ${NPM_URL}
`.trim()

const demoKeyboard = (active: string) => ({
  inline_keyboard: Object.entries(demos).map(([id, d]) => [
    {
      text: id === active ? `✅ ${d.title}` : d.title,
      callback_data: `${HOME_CALLBACK_PREFIX}${id}`
    }
  ])
})

const demoText = (active: string) => {
  const d = demos[active]!
  return [
    `<b>Active demo:</b> ${d.title}`,
    d.description,
    "",
    "Now just talk to the bot — messages go to the active demo.",
    "Pick another one below or send /demo to open this menu again.",
    "",
    `<a href="${SOURCE_URL}">Source code of the demos</a>`
  ].join("\n")
}

const noPreview = { link_preview_options: { is_disabled: true } }

/**
 * Persistent keyboard under the input field: shows which demo is active and
 * reopens the menu on tap. It stays until replaced, so the demo bots
 * themselves don't need to know about it.
 */
const switchKeyboard = (active: string) => ({
  keyboard: [[{ text: `${SWITCH_BUTTON_PREFIX}${demos[active]!.title} · switch demo` }]],
  resize_keyboard: true,
  is_persistent: true
})

const activeMessage = (active: string) => `${demos[active]!.title} is active — just talk to it.`

// --- bot ---------------------------------------------------------------------

export const makeHomeBot = (store: ModeStore) => {
  const showDemoMenu = async (chatId: number, ctx: BotContext) => {
    const active = (await store.get(chatId)) ?? DEFAULT_DEMO
    return ctx.reply(demoText(active), {
      parse_mode: "HTML",
      ...noPreview,
      reply_markup: demoKeyboard(active)
    })
  }

  return createBot()
    .onMessage(({ command, text }) => [
      command("/start", async ({ payload, ctx }) => {
        const active = (await store.get(payload.chat.id)) ?? DEFAULT_DEMO
        return ctx.reply(startMessage, {
          parse_mode: "HTML",
          reply_markup: switchKeyboard(active)
        })
      }),
      command("/source", ({ ctx }) =>
        ctx.reply(`GitHub: ${GITHUB_URL}\n\nStar the repo if you find it useful!`, noPreview)
      ),
      command("/install", ({ ctx }) =>
        ctx.reply(installMessage, { parse_mode: "HTML", ...noPreview })
      ),
      command("/features", ({ ctx }) => ctx.reply(featuresMessage, noPreview)),
      command("/demo", ({ payload, ctx }) => showDemoMenu(payload.chat.id, ctx)),
      // Tap on the persistent "🔀 <demo> · switch demo" button
      text(({ payload, ctx }) => showDemoMenu(payload.chat.id, ctx))
    ])
    .onCallbackQuery(({ data }) => [
      data(new RegExp(`^${HOME_CALLBACK_PREFIX}`), async ({ payload, ctx }) => {
        const id = payload.data!.slice(HOME_CALLBACK_PREFIX.length)
        const chatId = payload.message?.chat.id
        if (!demos[id] || chatId === undefined) {
          return ctx.answerCallbackQuery({ text: "Unknown demo", show_alert: true })
        }
        await store.set(chatId, id)
        return (
          ctx
            .answerCallbackQuery({ text: `${demos[id].title} is active` })
            .and(
              ctx.editMessageText(demoText(id), {
                parse_mode: "HTML",
                ...noPreview,
                reply_markup: demoKeyboard(id)
              })
            )
            // A fresh message is needed to swap the reply keyboard (edits can't carry one)
            .and(ctx.reply(activeMessage(id), { reply_markup: switchKeyboard(id) }))
        )
      })
    ])
}
