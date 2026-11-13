/**
 * The demo bot's public profile — what Telegram shows before anyone writes to
 * it: the short description on the profile and in shared links, the
 * description in an empty chat ("What can this bot do?"), and the "/" menu.
 * The Worker's /setup route applies it on every deploy.
 *
 * The profile photo is set once by hand in @BotFather (/setuserpic).
 */
import type { TgBotClient } from "@effect-ak/tg-bot-client"
import type { BotCommand } from "@effect-ak/tg-bot-api"

import { GITHUB_URL, HOME_COMMAND_LIST } from "./bots/home"

export const BOT_PROFILE = {
  /** Profile page and shared links, up to 120 characters. */
  short_description: "Live demo of @effect-ak/tg-bot, a type-safe Telegram bot SDK for TypeScript.",
  /** The empty chat, up to 512 characters. */
  description: [
    "I'm the live demo of @effect-ak/tg-bot, a type-safe Telegram bot SDK for TypeScript.",
    "",
    "Send /demo and pick one: tic-tac-toe in a widget, a reply streamed like an AI assistant, inline-keyboard screens, a file built in memory. Type @ and my name in any chat to share a code snippet.",
    "",
    "I run on Cloudflare Workers and remember only which demo each chat picked, for 30 days.",
    "",
    `Source: ${GITHUB_URL}`
  ].join("\n"),
  commands: HOME_COMMAND_LIST satisfies BotCommand[]
}

const sameCommands = (a: readonly BotCommand[], b: readonly BotCommand[]) =>
  a.length === b.length &&
  a.every((c, i) => c.command === b[i]?.command && c.description === b[i]?.description)

/**
 * Bring the bot's profile in line with {@link BOT_PROFILE}. Each value is read
 * first and written only when it differs — Telegram rate-limits these setters,
 * and a deploy that changes nothing should change nothing. Returns what was
 * updated.
 */
export const applyBotProfile = async (client: TgBotClient): Promise<string[]> => {
  const updated: string[] = []

  const { description } = await client.execute("get_my_description", {})
  if (description !== BOT_PROFILE.description) {
    await client.execute("set_my_description", { description: BOT_PROFILE.description })
    updated.push("description")
  }

  const { short_description } = await client.execute("get_my_short_description", {})
  if (short_description !== BOT_PROFILE.short_description) {
    await client.execute("set_my_short_description", {
      short_description: BOT_PROFILE.short_description
    })
    updated.push("short description")
  }

  const commands = await client.execute("get_my_commands", {})
  if (!sameCommands(commands, BOT_PROFILE.commands)) {
    await client.execute("set_my_commands", { commands: BOT_PROFILE.commands })
    updated.push("commands")
  }

  return updated
}
