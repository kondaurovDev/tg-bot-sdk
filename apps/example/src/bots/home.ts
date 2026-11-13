/**
 * Home bot: what you talk to when no demo is active. Describes the library
 * (/start, /source, /install, /features) and lets you switch the active demo
 * (/demo + inline buttons). The active demo is stored per chat via `ModeStore`
 * — KV on Cloudflare, an in-memory Map for local polling.
 */
import { BotResponse, createBot } from "@effect-ak/tg-bot"
import type { BotContext } from "@effect-ak/tg-bot"
import type { InlineQueryResultArticle, InputRichBlock, Update } from "@effect-ak/tg-bot-api"

import { demos, DEFAULT_DEMO } from "./registry"

export interface ModeStore {
  get(chatId: number): Promise<string | null>
  set(chatId: number, mode: string): Promise<void>
}

export const GITHUB_URL = "https://github.com/kondaurovDev/tg-bot-sdk"
export const NPM_URL = "https://www.npmjs.com/package/@effect-ak/tg-bot"
export const DOCS_URL = "https://tg-bot-sdk.website"
export const SOURCE_URL = `${GITHUB_URL}/tree/main/apps/example/src/bots`

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
  // Inline queries come from any chat, so they are never routed to a demo
  if (update.inline_query || update.chosen_inline_result) return true
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

/** `/features` as a rich message (Bot API 10.1+): heading, table, details, buttons. */
const cell = (text: string, is_header = false) => ({
  text,
  align: "left" as const,
  valign: "top" as const,
  ...(is_header ? { is_header } : {})
})

export const featuresBlocks: InputRichBlock[] = [
  { type: "heading", size: 2, text: "@effect-ak/tg-bot" },
  {
    type: "paragraph",
    text: [
      "A type-safe Telegram bot SDK for TypeScript, with ",
      { type: "bold", text: "zero runtime dependencies" },
      " and types generated from the official Bot API docs."
    ]
  },
  {
    type: "table",
    is_striped: true,
    cells: [
      [cell("Package", true), cell("What it does", true)],
      [cell("tg-bot"), cell("Builder API, handlers, polling and webhooks, screens, streaming")],
      [cell("tg-bot-client"), cell("Typed HTTP client over native fetch")],
      [cell("tg-bot-api"), cell("Types for every Bot API method and Mini Apps")],
      [cell("tg-bot-emulator"), cell("In-memory Bot API for tests, no token needed")]
    ]
  },
  {
    type: "details",
    summary: "What the demos here show",
    blocks: [
      {
        type: "list",
        items: [
          {
            blocks: [
              { type: "paragraph", text: "Menu Bot — inline-keyboard screens declared as data" }
            ]
          },
          {
            blocks: [{ type: "paragraph", text: "Tic-tac-toe — an HTML widget talking to the bot" }]
          },
          {
            blocks: [
              { type: "paragraph", text: "Streaming — replies typed in like an AI assistant" }
            ]
          },
          { blocks: [{ type: "paragraph", text: "File Bot — sending files built in memory" }] }
        ]
      },
      {
        type: "paragraph",
        text: "Inline mode too: type @ and my name in any chat to share a snippet."
      }
    ]
  },
  {
    type: "buttons",
    buttons: [
      { text: "GitHub", url: GITHUB_URL, style: "primary" },
      { text: "Docs", url: DOCS_URL },
      { text: "npm", url: NPM_URL }
    ]
  }
]

// --- inline mode -------------------------------------------------------------

interface Snippet {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly code: string
}

export const SNIPPETS: readonly Snippet[] = [
  {
    id: "start",
    title: "Hello bot",
    description: "A /start command with long polling",
    code: `createBot()
  .command("/start", ({ ctx }) => ctx.reply("Hello!"))
  .run({ bot_token })`
  },
  {
    id: "webhook",
    title: "Webhook on Cloudflare Workers",
    description: "Secret token verified for you",
    code: `const handler = createBot()
  .onText(({ payload, ctx }) => ctx.reply(payload.text!))
  .webhook({ bot_token, secret_token })

export default { fetch: handler }`
  },
  {
    id: "keyboard",
    title: "Inline keyboard",
    description: "Buttons that edit the message in place",
    code: `createBot()
  .command("/start", ({ ctx }) =>
    ctx.reply("Pick one", {
      reply_markup: { inline_keyboard: [[{ text: "Red", callback_data: "red" }]] }
    }))
  .onCallback("red", ({ ctx }) => ctx.editMessageText("You picked red"))`
  },
  {
    id: "stream",
    title: "Streaming reply",
    description: "Thinking…, then text typed in word by word",
    code: `createBot()
  .onText(({ ctx }) => ctx.stream(llm.streamText(prompt)))`
  },
  {
    id: "widget",
    title: "Widget request",
    description: "Answer an HTML widget (Bot API 10.4)",
    code: `createBot()
  .onWidgetQuery(({ data }) => [
    data(/^vote:/, ({ payload, ctx }) => [
      ctx.answerWidgetQuery("counted"),
      ctx.editWidgetData({ chat_data: payload.data })
    ])
  ])`
  },
  {
    id: "test",
    title: "Test without a token",
    description: "Run the bot against the in-memory emulator",
    code: `const emulator = makeTgBotEmulator()
await bot.run({ client: emulator.client })
emulator.sendMessage("/start")
expect((await emulator.nextBotMessage()).text).toBe("Hello!")`
  }
]

const escapeHtml = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")

export const snippetResults = (query: string): InlineQueryResultArticle[] => {
  const q = query.trim().toLowerCase()
  return SNIPPETS.filter(
    (s) => !q || `${s.id} ${s.title} ${s.description}`.toLowerCase().includes(q)
  ).map((s) => ({
    type: "article",
    id: s.id,
    title: s.title,
    description: s.description,
    input_message_content: {
      message_text: `<b>${s.title}</b> · @effect-ak/tg-bot\n<pre language="typescript">${escapeHtml(s.code)}</pre>`,
      parse_mode: "HTML"
    }
  }))
}

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

  return (
    createBot()
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
        command("/features", () =>
          BotResponse.make({ type: "rich_message", rich_message: { blocks: featuresBlocks } })
        ),
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
      // `@bot <query>` in any chat: share a code snippet (enable inline mode in @BotFather)
      .onInlineQuery(({ fallback }) => [
        fallback(({ payload, ctx }) =>
          ctx.call("answer_inline_query", {
            inline_query_id: payload.id,
            results: snippetResults(payload.query),
            cache_time: 300
          })
        )
      ])
  )
}
