/**
 * The live run: calls the real Bot API with a real bot and validates every
 * response against the spec the types are generated from.
 *
 * Needs `bot_token` and `chat_id` in the environment and is skipped without
 * them (`E2E_REQUIRED=true` turns the skip into a failure, for CI). Every
 * step is safe to repeat on a bot that is in use: nothing touches the webhook,
 * what a step sets it removes, and the messages it sends it deletes.
 *
 * To cover another method, add a call to a step (or a step): `h.call` checks
 * the result on its own.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import type { ChatMember } from "@effect-ak/tg-bot-api"
import { makeTgBotClient } from "@effect-ak/tg-bot-client"

import { makeHarness, type Harness } from "../src/harness"
import { makePng } from "../src/png"
import { loadBotApiSpec } from "../src/spec"

const bot_token = process.env["bot_token"]
const rawChatId = process.env["chat_id"]
const configured = Boolean(bot_token && rawChatId)

if (!configured && process.env["E2E_REQUIRED"] === "true") {
  throw new Error("E2E_REQUIRED is set, but bot_token and chat_id are not both defined")
}

const chat_id = rawChatId && /^-?\d+$/.test(rawChatId) ? Number(rawChatId) : (rawChatId ?? "")

describe.skipIf(!configured)("Bot API against the real Telegram", () => {
  let h: Harness

  /** Messages the run sent and has not deleted yet. */
  const sent: number[] = []
  const keep = <M extends { message_id: number }>(message: M): M => {
    sent.push(message.message_id)
    return message
  }

  let botId = 0
  let hasWebhook = false
  let chatType = "private"
  let member: ChatMember | undefined

  const isAdmin = () => member?.status === "administrator" || member?.status === "creator"
  const can = (right: "can_pin_messages" | "can_invite_users"): boolean =>
    member?.status === "creator" || (member?.status === "administrator" && member[right] === true)

  /**
   * A test whose calls must all succeed and whose responses must all match the
   * spec. `skip(reason)` leaves the step out when the chat does not allow it.
   */
  const step = (name: string, run: (skip: (reason: string) => never) => Promise<void>) =>
    it(name, async (context) => {
      let failure: unknown
      try {
        await run((reason) => context.skip(reason))
      } catch (error) {
        failure = error
      }
      // Taken even when a call failed, so one step's issues never surface in the next
      const issues = h.takeIssues()
      if (failure !== undefined) {
        if (issues.length > 0) console.error(issues.join("\n"))
        throw failure
      }
      expect(issues, "responses that differ from the spec").toEqual([])
    })

  beforeAll(() => {
    h = makeHarness(loadBotApiSpec(), makeTgBotClient({ bot_token: bot_token ?? "" }))
  })

  afterAll(async () => {
    // Whatever a failed step left behind; the result is not part of the run. One by one,
    // so a message that cannot be deleted does not keep the rest in the chat
    for (const message_id of sent) {
      await h.client.executeSafe("delete_message", { chat_id, message_id })
    }
    h.writeSummary()
  })

  // ── The bot itself ──

  step("the bot's identity and profile", async () => {
    const me = await h.call("get_me", {})
    botId = me.id
    await h.call("get_my_name", {})
    await h.call("get_my_description", {})
    await h.call("get_my_short_description", {})
    await h.call("get_my_commands", {})
    await h.call("get_my_default_administrator_rights", {})
    await h.call("get_chat_menu_button", {})
    await h.call("get_user_profile_photos", { user_id: me.id, limit: 1 })
  })

  step("settings: set_my_settings with the value the bot already has", async () => {
    const me = await h.call("get_me", {})
    await h.call("set_my_settings", { can_join_groups: me.can_join_groups })
    const after = await h.call("get_me", {})
    expect(after.can_join_groups).toBe(me.can_join_groups)
  })

  step("commands scoped to the test chat: set, read, delete", async () => {
    const scope = { type: "chat", chat_id } as const
    const commands = [{ command: "e2e", description: "Set by the e2e run, removed right after" }]
    await h.call("set_my_commands", { commands, scope })
    try {
      expect(await h.call("get_my_commands", { scope })).toEqual(commands)
    } finally {
      await h.call("delete_my_commands", { scope })
    }
  })

  step("webhook info, and pending updates when there is no webhook", async () => {
    const info = await h.call("get_webhook_info", {})
    hasWebhook = info.url !== ""
    // With a webhook set, get_updates is a 409; without an offset it confirms nothing
    if (!hasWebhook) await h.call("get_updates", { limit: 10, timeout: 0 })
  })

  step("stars and gifts", async () => {
    await h.call("get_my_star_balance", {})
    await h.call("get_star_transactions", { limit: 5 })
    await h.call("get_available_gifts", {})
  })

  step("stickers: topic icons, a custom emoji, a sticker set", async () => {
    const icons = await h.call("get_forum_topic_icon_stickers", {})
    const icon = icons[0]
    if (icon?.custom_emoji_id) {
      await h.call("get_custom_emoji_stickers", { custom_emoji_ids: [icon.custom_emoji_id] })
    }
    if (icon?.set_name) await h.call("get_sticker_set", { name: icon.set_name })
  })

  step("chat share theme backdrops", async () => {
    await h.call("get_chat_share_theme_backdrops", {})
  })

  // ── The test chat ──

  step("the chat and the bot's membership in it", async () => {
    const chat = await h.call("get_chat", { chat_id })
    chatType = chat.type
    member = await h.call("get_chat_member", { chat_id, user_id: botId })
    await h.call("send_chat_action", { chat_id, action: "typing" })
  })

  step("text: send with entities and a keyboard, edit, reply, delete", async () => {
    const message = keep(
      await h.call("send_message", {
        chat_id,
        text: '<b>e2e</b> <i>run</i> <code>code</code> <a href="https://core.telegram.org/bots/api">link</a>\n<blockquote>quote</blockquote>',
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
        disable_notification: true,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "URL", url: "https://core.telegram.org/bots/api" },
              { text: "Callback", callback_data: "e2e" }
            ]
          ]
        }
      })
    )
    const { message_id } = message

    const keyboard = { inline_keyboard: [[{ text: "Callback", callback_data: "e2e" }]] }
    // Without reply_markup an edit drops the keyboard, and the next edit would change nothing
    await h.call("edit_message_text", {
      chat_id,
      message_id,
      text: "e2e run, edited",
      reply_markup: keyboard
    })
    await h.call("edit_message_reply_markup", { chat_id, message_id })

    keep(
      await h.call("send_message", {
        chat_id,
        text: "a reply",
        disable_notification: true,
        reply_parameters: { message_id }
      })
    )
  })

  step("reactions: set and clear", async () => {
    const { message_id } = keep(
      await h.call("send_message", { chat_id, text: "react to me", disable_notification: true })
    )
    await h.call("set_message_reaction", {
      chat_id,
      message_id,
      reaction: [{ type: "emoji", emoji: "👍" }]
    })
    await h.call("set_message_reaction", { chat_id, message_id, reaction: [] })
  })

  step("photo: upload, edit the caption, replace the media, resend by file_id", async () => {
    const photo = keep(
      await h.call("send_photo", {
        chat_id,
        photo: { file_content: makePng(320, 240, [42, 171, 238]), file_name: "blue.png" },
        caption: "a photo",
        disable_notification: true
      })
    )
    const { message_id } = photo
    await h.call("edit_message_caption", { chat_id, message_id, caption: "a photo, edited" })
    // A file nested in an object: the client sends it as `attach://`
    await h.call("edit_message_media", {
      chat_id,
      message_id,
      media: {
        type: "photo",
        media: { file_content: makePng(320, 240, [238, 99, 42]), file_name: "orange.png" }
      }
    })

    const file_id = photo.photo?.at(-1)?.file_id
    expect(file_id, "send_photo returned no photo sizes").toBeDefined()
    if (file_id) {
      keep(await h.call("send_photo", { chat_id, photo: file_id, disable_notification: true }))
    }
  })

  step("document: upload, get_file, download the same bytes", async () => {
    const content = new TextEncoder().encode(`e2e run ${new Date().toISOString()}\n`)
    const message = keep(
      await h.call("send_document", {
        chat_id,
        document: { file_content: content, file_name: "e2e.txt" },
        disable_notification: true
      })
    )
    const file_id = message.document?.file_id
    expect(file_id, "send_document returned no document").toBeDefined()
    if (!file_id) return

    await h.call("get_file", { file_id })
    const downloaded = await h.client.getFile({ fileId: file_id })
    expect(new Uint8Array(downloaded.content)).toEqual(content)
  })

  step("album: two uploaded photos in one send_media_group", async () => {
    const album = await h.call("send_media_group", {
      chat_id,
      disable_notification: true,
      media: [
        {
          type: "photo",
          media: { file_content: makePng(320, 240, [80, 200, 120]), file_name: "green.png" },
          caption: "an album"
        },
        {
          type: "photo",
          media: { file_content: makePng(320, 240, [200, 80, 160]), file_name: "pink.png" }
        }
      ]
    })
    album.forEach(keep)
    expect(album).toHaveLength(2)
  })

  step("location, venue, contact, dice", async () => {
    const quiet = { chat_id, disable_notification: true }
    keep(await h.call("send_location", { ...quiet, latitude: 41.7151, longitude: 44.8271 }))
    keep(
      await h.call("send_venue", {
        ...quiet,
        latitude: 41.7151,
        longitude: 44.8271,
        title: "A venue",
        address: "1 Test street"
      })
    )
    keep(
      await h.call("send_contact", { ...quiet, phone_number: "+10000000000", first_name: "E2E" })
    )
    // A dice in a private chat cannot be deleted for 24 hours, and the run leaves nothing behind
    if (chatType !== "private") keep(await h.call("send_dice", { ...quiet, emoji: "🎲" }))
  })

  step("poll: send and stop", async () => {
    const { message_id } = keep(
      await h.call("send_poll", {
        chat_id,
        question: "Does the response match the spec?",
        options: [{ text: "Yes" }, { text: "No" }],
        disable_notification: true
      })
    )
    await h.call("stop_poll", { chat_id, message_id })
  })

  step("forward and copy, one message and several", async () => {
    const quiet = { chat_id, from_chat_id: chat_id, disable_notification: true }
    const first = keep(await h.call("send_message", { chat_id, text: "forward me" }))
    const second = keep(await h.call("send_message", { chat_id, text: "and me" }))
    const message_ids = [first.message_id, second.message_id]

    keep(await h.call("forward_message", { ...quiet, message_id: first.message_id }))
    keep(await h.call("copy_message", { ...quiet, message_id: first.message_id }))
    ;(await h.call("forward_messages", { ...quiet, message_ids })).forEach(keep)
    ;(await h.call("copy_messages", { ...quiet, message_ids })).forEach(keep)
  })

  step("pin: pin, read it back from get_chat, unpin", async (skip) => {
    if (chatType !== "private" && !can("can_pin_messages")) {
      skip("the bot has no right to pin messages in the test chat")
    }
    const { message_id } = keep(
      await h.call("send_message", { chat_id, text: "pin me", disable_notification: true })
    )
    await h.call("pin_chat_message", { chat_id, message_id, disable_notification: true })
    try {
      const chat = await h.call("get_chat", { chat_id })
      expect(chat.pinned_message?.message_id).toBe(message_id)
    } finally {
      await h.call("unpin_chat_message", { chat_id, message_id })
    }
  })

  step("group: administrators and the member count", async (skip) => {
    if (chatType === "private") skip("the test chat is a private chat")
    await h.call("get_chat_member_count", { chat_id })
    if (isAdmin()) await h.call("get_chat_administrators", { chat_id })
  })

  step("group: an invite link, created, edited and revoked", async (skip) => {
    if (chatType === "private" || !can("can_invite_users")) {
      skip("the bot cannot create invite links in the test chat")
    }
    const { invite_link } = await h.call("create_chat_invite_link", {
      chat_id,
      name: "e2e",
      member_limit: 1,
      expire_date: Math.floor(Date.now() / 1000) + 3600
    })
    try {
      await h.call("edit_chat_invite_link", { chat_id, invite_link, name: "e2e, edited" })
    } finally {
      await h.call("revoke_chat_invite_link", { chat_id, invite_link })
    }
  })

  // ── Cleanup, which is two more methods to check ──

  step("delete what the run sent", async () => {
    // An id leaves `sent` only once its message is gone: afterAll retries what is left
    const [first] = sent
    if (first !== undefined) {
      await h.call("delete_message", { chat_id, message_id: first })
      sent.shift()
    }
    while (sent.length > 0) {
      await h.call("delete_messages", { chat_id, message_ids: sent.slice(0, 100) })
      sent.splice(0, 100)
    }
  })
})
