/**
 * Demo bots that can be switched on per chat. Each entry is a plain
 * `createBot()`; the home bot (`home.ts`) shows them in a menu.
 */
import type { Bot } from "@effect-ak/tg-bot"

import * as echo from "./echo"
import * as command from "./command"
import * as file from "./file"
import * as menu from "./menu"

export interface Demo {
  title: string
  description: string
  bot: Bot
}

export const demos: Record<string, Demo> = {
  menu: { title: "🔘 Menu Bot", description: menu.description, bot: menu.default },
  echo: { title: "🦜 Echo Bot", description: echo.description, bot: echo.default },
  command: { title: "⌨️ Command Bot", description: command.description, bot: command.default },
  file: { title: "📄 File Bot", description: file.description, bot: file.default }
}

export const DEFAULT_DEMO = "menu"
