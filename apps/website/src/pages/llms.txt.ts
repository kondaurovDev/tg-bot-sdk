/**
 * /llms.txt — index for LLMs and coding agents (https://llmstxt.org).
 * Lists the guide pages with one-line summaries; /llms-full.txt has the
 * full text of every guide inlined.
 */
import type { APIRoute } from "astro"
import { getCollection } from "astro:content"

const SITE = "https://tg-bot-sdk.website"

const isGuide = (id: string) => !id.startsWith("api/") && id !== "api" && id !== "index"

const SECTIONS: [prefix: string, title: string][] = [
  ["getting-started/", "Getting started"],
  ["bot-runner/", "Bot framework (@effect-ak/tg-bot)"],
  ["client/", "HTTP client (@effect-ak/tg-bot-client)"],
  ["api-types/", "API types (@effect-ak/tg-bot-api)"],
  ["", "Other"]
]

const sectionOf = (id: string): string => SECTIONS.find(([p]) => id.startsWith(p))![1]

export const GET: APIRoute = async () => {
  const docs = (await getCollection("docs")).filter((d) => isGuide(d.id))

  const sections = new Map<string, string[]>(SECTIONS.map(([, title]) => [title, []]))
  for (const doc of docs) {
    const line =
      `- [${doc.data.title}](${SITE}/${doc.id}/): ${doc.data.description ?? ""}`.trimEnd()
    const list = sections.get(sectionOf(doc.id)) ?? []
    list.push(line)
    sections.set(sectionOf(doc.id), list)
  }

  const body = [
    "# Telegram Bot SDK",
    "",
    "> Type-safe TypeScript SDK for Telegram bots. Three npm packages: `@effect-ak/tg-bot-api` (types generated from the official Bot API docs), `@effect-ak/tg-bot-client` (HTTP client over native fetch, zero deps), `@effect-ak/tg-bot` (bot framework: fluent builder, long polling, webhooks with secret token, inline-keyboard screens as data, `ctx.stream` for streaming replies). Plus `@effect-ak/tg-bot-emulator` (in-memory Bot API emulator for tests: `bot.run({ client: emulator.client })`, no token or network).",
    "",
    "Conventions that matter when writing code against these packages:",
    '- Bot API methods are called in snake_case exactly as in the official docs: `client.execute("send_message", { chat_id, text })`.',
    "- Bot handlers receive `{ payload, ctx }` — `payload` is the typed `Message` / `CallbackQuery` / … (not the `Update` envelope) — and return a `BotResponse` or an array of them (via `ctx.reply`, `ctx.editMessageText`, `ctx.answerCallbackQuery`, `ctx.call(method, params)`); they do not call the API directly.",
    '- Simple bots: `createBot().command("/start", h).onText(h).onCallback("data", h)`; the `onMessage(({ command, text, fallback }) => [...])` form is for ordered handler lists.',
    "- Errors are discriminated unions (`{ ok: true, data } | { ok: false, error }` from `executeSafe`), or `TgBotClientError` when using `execute`.",
    "- Files are uploaded as `{ file_content: Uint8Array, file_name: string }` anywhere the API accepts `InputFile`.",
    "- Webhook handlers should always be created with `secret_token`; the handler returns 403 when the `X-Telegram-Bot-Api-Secret-Token` header does not match.",
    "- To test a bot, pass `{ client: emulator.client }` to `run()` instead of `bot_token`, then drive it with `emulator.sendMessage(...)`, `emulator.tapButton(...)` and `await emulator.nextBotMessage()`.",
    "",
    "Source: https://github.com/kondaurovDev/tg-bot-sdk — repo conventions for agents are in `.claude/CLAUDE.md`; a runnable Cloudflare Workers demo is in `example/`.",
    "",
    ...[...sections.entries()]
      .filter(([, lines]) => lines.length > 0)
      .flatMap(([title, lines]) => [`## ${title}`, "", ...lines, ""]),
    "## Reference",
    "",
    `- [Full guides in one file](${SITE}/llms-full.txt): every page above, inlined`,
    `- [Bot API methods](${SITE}/api/): one page per method, generated from the official docs`,
    `- [Bot API types](${SITE}/api/types/): one page per type`,
    `- [bot-api.json](${SITE}/bot-api.json): machine-readable spec of all methods, parameters and types (what the codegen emits)`,
    `- [mini-app.json](${SITE}/mini-app.json): machine-readable spec of Telegram.WebApp (Mini Apps)`,
    `- [Playground](${SITE}/playground/): run a bot in the browser`,
    ""
  ].join("\n")

  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } })
}
