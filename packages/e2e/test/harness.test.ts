/**
 * The harness, run against the emulator instead of Telegram: the same code
 * path as the live run, with no token. It also holds the emulator to the
 * spec: what it returns must be what the real API is documented to return.
 */
import { describe, expect, it } from "vitest"

import { makeTgBotEmulator } from "@effect-ak/tg-bot-emulator"

import { makeHarness } from "../src/harness"
import { makePng } from "../src/png"
import { isInterface, loadBotApiSpec, type BotApiSpec } from "../src/spec"

const spec = loadBotApiSpec()

describe("harness", () => {
  it("validates every result and counts the methods", async () => {
    const emulator = makeTgBotEmulator()
    const h = makeHarness(spec, emulator.client, { paceMs: 0 })
    const chat_id = emulator.chat.id

    await h.call("get_me", {})
    await h.call("get_chat", { chat_id })
    const { message_id } = await h.call("send_message", {
      chat_id,
      text: "<b>hi</b>",
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "Tap", callback_data: "tap" }]] }
    })
    await h.call("edit_message_text", { chat_id, message_id, text: "edited" })
    await h.call("send_photo", {
      chat_id,
      photo: { file_content: makePng(8, 8, [0, 0, 0]), file_name: "black.png" }
    })
    await h.call("set_my_settings", { supports_inline_queries: true })
    await h.call("get_me", {})
    await h.call("delete_message", { chat_id, message_id })

    expect(h.takeIssues()).toEqual([])
    const summary = h.summary()
    expect(summary).toContain(`Methods exercised: **7** of ${spec.methods.length}`)
    expect(summary).toContain("Responses validated: **8**")
    expect(summary).toContain("`getMe`")
  })

  it("throws on an API error, naming the method and the reason", async () => {
    const emulator = makeTgBotEmulator()
    const h = makeHarness(spec, emulator.client, { paceMs: 0 })

    await expect(
      h.call("edit_message_text", { chat_id: emulator.chat.id, message_id: 404, text: "x" })
    ).rejects.toThrow(/^editMessageText: Telegram API returned an error/)
  })

  it("hands each issue out once and keeps it in the summary", async () => {
    const emulator = makeTgBotEmulator()
    // A spec that is behind the API: it does not know a field get_me returns
    const behind: BotApiSpec = {
      ...spec,
      types: spec.types.map((decl) =>
        decl.name === "BotFullInfo" && isInterface(decl)
          ? { ...decl, fields: decl.fields.filter((f) => f.name !== "has_topic_sidebar") }
          : decl
      )
    }
    const h = makeHarness(behind, emulator.client, { paceMs: 0 })

    await h.call("get_me", {})
    await h.call("get_me", {})

    const line =
      "getMe [unknown-field] BotFullInfo.has_topic_sidebar: the spec has no such field (it holds boolean) (at result.has_topic_sidebar)"
    expect(h.takeIssues()).toEqual([line, line])
    expect(h.takeIssues()).toEqual([])
    expect(h.summary()).toContain("Unexpected differences: **1**")
    expect(h.summary()).toContain("`BotFullInfo.has_topic_sidebar` — unknown-field")
  })
})
