/**
 * Demo bots that can be switched on per chat. Each entry is a plain
 * `createBot()`; the home bot (`home.ts`) shows them in a menu.
 */
import type { Bot } from "@effect-ak/tg-bot"

import * as file from "./file"
import * as menu from "./menu"
import * as stream from "./stream"
import * as tictactoe from "./tictactoe"

export interface Demo {
  title: string
  description: string
  bot: Bot
}

export const demos: Record<string, Demo> = {
  menu: { title: "🔘 Menu Bot", description: menu.description, bot: menu.default },
  tictactoe: {
    title: "⭕ Tic-tac-toe Widget",
    description: tictactoe.description,
    bot: tictactoe.default
  },
  stream: { title: "💬 Streaming Bot", description: stream.description, bot: stream.default },
  file: { title: "📄 File Bot", description: file.description, bot: file.default }
}

export const DEFAULT_DEMO = "menu"
