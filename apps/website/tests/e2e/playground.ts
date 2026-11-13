#!/usr/bin/env node
/**
 * Smoke test of the playground's emulator mode in the iOS simulator's Safari:
 * every example is picked, sent its typical input, and its replies are
 * asserted on the DOM — buttons tapped, drafts streamed, messages edited in
 * place. A failure names the example and the check, and leaves a screenshot
 * in the temp dir.
 *
 *   node apps/website/tests/e2e/playground.ts [@<device>] [example …]
 *
 * `example` is a file name without `.ts` (`rich`, `screens`…); none runs
 * them all. `@ipad` picks one of several booted simulators.
 *
 * Needs the dev server (procdeck proc `website`; PLAYGROUND_URL overrides
 * the URL), a booted simulator, and the Safari driver from the garage repo
 * (`tools/sim`; GARAGE_SIM points elsewhere). It talks to CoreSimulator, so
 * it runs outside the Bash sandbox. See the `playground-sim` skill.
 */
import { execFileSync } from "node:child_process"
import { homedir, tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

type Driver = {
  start(url: string, options: { pick?: string; fresh?: boolean }): Promise<{ udid: string }>
  tap(target: string, nth?: number): Promise<void>
  type(target: string, text: string): Promise<string>
  key(name: "Enter" | "Escape" | "Tab"): Promise<void>
  texts(target: string): Promise<string[]>
  count(target: string): Promise<number>
  wait(target: string, seconds?: number): Promise<void>
  gone(target: string, seconds?: number): Promise<void>
  shot(path: string): Promise<string>
  open(target: string): Promise<string>
}

const SIM = process.env["GARAGE_SIM"] ?? join(homedir(), "Projects/garage/tools/sim")
const web: Driver = await import(pathToFileURL(join(SIM, "src/web/driver.ts")).href)

// procdeck's stable address for the proc (it proxies to Astro's own port)
const deckUrl = (): string => {
  const status: unknown = JSON.parse(
    execFileSync("procdeck", ["status", "--json"], { encoding: "utf8" })
  )
  const procs =
    typeof status === "object" && status !== null && "procs" in status ? status.procs : []
  const website = Array.isArray(procs) ? procs.find((proc) => proc?.id === "website") : undefined
  if (typeof website?.url !== "string")
    throw new Error("procdeck has no `website` proc — is the deck up?")
  return website.url
}

const PLAYGROUND = process.env["PLAYGROUND_URL"] ?? deckUrl()

const BOT = '[data-testid="message"][data-from="bot"]'
const IDLE = '[data-testid="chat"][data-bot="running"][data-busy="false"]'

class Failed extends Error {}

const botTexts = () => web.texts(BOT)

/** Poll until some bot message contains `text`. */
const reply = async (text: string, seconds = 10) => {
  const deadline = Date.now() + seconds * 1000
  for (;;) {
    const texts = await botTexts()
    if (texts.some((t) => t.includes(text))) return
    if (Date.now() > deadline) {
      throw new Failed(
        `no bot message with ${JSON.stringify(text)}; the bot said ${JSON.stringify(texts)}`
      )
    }
    await new Promise((done) => setTimeout(done, 250))
  }
}

const send = async (text: string) => {
  await web.wait(IDLE, 15)
  const value = await web.type("#chat-input", text)
  if (value !== text)
    throw new Failed(`the input holds ${JSON.stringify(value)}, not ${JSON.stringify(text)}`)
  await web.key("Enter")
}

const check = (ok: boolean, what: string) => {
  if (!ok) throw new Failed(what)
}

const pick = async (file: string) => {
  await web.tap("#example-picker")
  await web.tap(`[data-testid="example-option"][data-example="${file}"]`)
  await web.wait(`[data-testid="example-picker"][data-example="${file}"]`)
  // Switching restarts the bot with an empty chat
  await web.wait(IDLE, 20)
  await web.wait("#chat-start", 10)
}

const examples: Record<string, () => Promise<void>> = {
  empty: async () => {
    await web.tap("#chat-start")
    await reply("I'm alive")
    await send("ping")
    await reply("you said: ping")
  },
  echo: async () => {
    await send("hello")
    await reply("You said: hello")
    await web.wait('[data-testid="reaction"]')
  },
  command: async () => {
    // /start fills the Menu (set_my_commands)
    await send("/start")
    await reply("Open the Menu")
    await web.tap("#chat-menu")
    await web.tap('[data-testid="command-item"][data-command="/help"]')
    await reply("Available commands")
    await send("/echo")
    await reply('"message_id"')
    // A reply keyboard: a key sends its text, "Done" removes it
    await send("/fruit")
    await web.wait('[data-testid="reply-keyboard-button"]')
    await web.tap('[data-testid="reply-keyboard-button"]', 0)
    await reply("You said: 🍎 Apple")
    await web.tap('[data-testid="reply-keyboard-button"]', 2)
    await reply("Keyboard removed")
    await web.gone("#reply-keyboard")
  },
  screens: async () => {
    await send("/start")
    await reply("Neon Coffee")
    await web.tap('[data-testid="keyboard-button"]', 0)
    await reply("Espresso")
    check((await web.count(BOT)) === 1, "the menu screen is a new message, not an edit in place")
    await web.tap('[data-testid="keyboard-button"]', 1)
    await reply("Neon Coffee")
  },
  rich: async () => {
    await send("/report")
    await reply("Weekly report")
    await web.tap('button[data-callback="report:approve"]')
    await reply("Approved")
    await web.tap('button[data-callback="report:reject"]')
    await reply("Rejected")
  },
  widget: async () => {
    // The widget loads in its sandbox with the bot's first state. A tap inside
    // the iframe is out of the DOM driver's reach (another origin).
    await send("game")
    await web.wait('[data-testid="widget"][data-ready="true"]', 15)
    await web.wait('[data-testid="widget"][data-chat-data="---------p"]')
  },
  stream: async () => {
    await send("/story")
    await web.wait("#chat-draft", 10)
    await web.gone("#chat-draft", 30)
    await reply("ctx.stream")
  },
  file: async () => {
    await send("some text")
    await reply("message.txt")
    await web.wait('[data-testid="document"]')
  },
  dice: async () => {
    await send("/roll")
    await reply("6 wins")
    const before = await web.count(BOT)
    await web.tap('[data-testid="keyboard-button"]')
    await web.wait(IDLE, 15)
    const deadline = Date.now() + 10_000
    while ((await web.count(BOT)) < before + 2 && Date.now() < deadline) {
      await new Promise((done) => setTimeout(done, 250))
    }
    check((await web.count(BOT)) >= before + 2, "Roll again sent no dice and no message")
  }
}

const argv = process.argv.slice(2)
const device = argv[0]?.startsWith("@") ? argv.shift()?.slice(1) : undefined
const unknown = argv.filter((name) => !(name in examples))
if (unknown.length > 0) {
  console.error(`unknown example ${unknown.join(", ")}; known: ${Object.keys(examples).join(", ")}`)
  process.exit(1)
}
const chosen = argv.length > 0 ? argv : Object.keys(examples)

// A URL of its own: Safari would bring forward a tab already open on the same one
const startUrl = new URL(PLAYGROUND)
startUrl.searchParams.set("e2e", String(Date.now()))
await web.start(startUrl.toString(), {
  fresh: true,
  ...(device === undefined ? {} : { pick: device })
})
await web.wait("#example-picker", 30)

let failures = 0
for (const name of chosen) {
  const started = Date.now()
  try {
    await pick(`${name}.ts`)
    await examples[name]?.()
    console.log(`ok    ${name} (${((Date.now() - started) / 1000).toFixed(1)} s)`)
  } catch (error) {
    failures++
    const shot = await web
      .shot(join(tmpdir(), `playground-${name}.png`))
      .catch(() => "no screenshot")
    const reason = error instanceof Error ? error.message : String(error)
    console.log(`FAIL  ${name}: ${reason}\n      ${shot}`)
  }
}
// A deep link opens its example
try {
  await web.open(`${PLAYGROUND}?example=rich`)
  await web.wait('[data-testid="example-picker"][data-example="rich.ts"]', 20)
  console.log("ok    deep link ?example=rich")
} catch (error) {
  failures++
  console.log(`FAIL  deep link: ${error instanceof Error ? error.message : String(error)}`)
}

process.exitCode = failures > 0 ? 1 : 0
