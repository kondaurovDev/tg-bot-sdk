/**
 * The demo bot's public profile — what Telegram shows before anyone writes to
 * it: the short description on the profile and in shared links, the
 * description in an empty chat ("What can this bot do?"), and the "/" menu.
 * The Worker's /setup route applies it on every deploy.
 *
 * The profile photo (`assets/avatar.jpg`, rendered from `assets/avatar.svg`)
 * is uploaded only while the bot has none: Telegram has no way to compare it,
 * and a new upload on every deploy would pile up photos. To replace it,
 * remove the current one in @BotFather and deploy again.
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
export const applyBotProfile = async (
  client: TgBotClient,
  options: { photo?: Uint8Array<ArrayBuffer> } = {}
): Promise<string[]> => {
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

  if (options.photo) {
    const me = await client.execute("get_me", {})
    const { total_count } = await client.execute("get_user_profile_photos", {
      user_id: me.id,
      limit: 1
    })
    if (total_count === 0) {
      // A file nested in the call's object: the client uploads it as its own
      // part and sends `attach://…` in its place
      await client.execute("set_my_profile_photo", {
        photo: { type: "static", photo: { file_content: options.photo, file_name: "avatar.jpg" } }
      })
      updated.push("photo")
    }
  }

  return updated
}
