/**
 * Demo bots that can be switched on per chat. Each entry is a plain
 * `createBot()`; the home bot (`home.ts`) shows them in a menu, and a demo's
 * key is also its command (`/inspector`) and its deep link (`?start=inspector`).
 */
import type { Bot } from "@effect-ak/tg-bot"

import * as file from "./file"
import * as inspector from "./inspector"
import * as menu from "./menu"
import * as stream from "./stream"
import * as tictactoe from "./tictactoe"

export interface Demo {
  title: string
  description: string
  /** What to do next, said right after the demo is switched on. */
  prompt: string
  bot: Bot
}

export const demos: Record<string, Demo> = {
  menu: {
    title: "🔘 Menu Bot",
    description: menu.description,
    prompt: "Send any message to open the menu.",
    bot: menu.default
  },
  tictactoe: {
    title: "⭕ Tic-tac-toe Widget",
    description: tictactoe.description,
    prompt: "Send any message to get the board.",
    bot: tictactoe.default
  },
  stream: {
    title: "💬 Streaming Bot",
    description: stream.description,
    prompt: "Ask a question — for example: how do I test my bot?",
    bot: stream.default
  },
  file: {
    title: "📄 File Bot",
    description: file.description,
    prompt: "Send any text.",
    bot: file.default
  },
  inspector: {
    title: "🔍 Inspector",
    description: inspector.description,
    prompt: "Send or forward any message.",
    bot: inspector.default
  }
}

export const DEFAULT_DEMO = "menu"
