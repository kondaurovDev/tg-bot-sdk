/**
 * Run any bot from `src/bots` locally with long polling.
 *
 *   pnpm polling menu     # or echo | command | file | home
 */
import type { Bot } from "@effect-ak/tg-bot"

import { loadConfig } from "../config"
import { makeHomeBot } from "../bots/home"
import { demos } from "../bots/registry"

const name = process.argv[2] ?? "menu"

const memory = new Map<number, string>()
const bots: Record<string, Bot> = {
  ...Object.fromEntries(Object.entries(demos).map(([id, d]) => [id, d.bot])),
  home: makeHomeBot({
    get: async (chatId) => memory.get(chatId) ?? null,
    set: async (chatId, mode) => void memory.set(chatId, mode)
  })
}

const bot = bots[name]
if (!bot) {
  console.error(`Unknown bot "${name}". Available: ${Object.keys(bots).join(", ")}`)
  process.exit(1)
}

const config = loadConfig()

console.log(`Running "${name}" bot with long polling. Press Ctrl+C to stop.`)
await bot.run({ bot_token: config.token, poll: { log_level: "debug" } })
