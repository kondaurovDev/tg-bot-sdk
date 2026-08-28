import { describe, expect, it } from "vitest"

import { makeTgBotEmulator } from "~/emulator"

describe("send_message_draft", () => {
  it("empty text shows the Thinking placeholder", async () => {
    const emulator = makeTgBotEmulator()
    await emulator.client.execute("send_message_draft", {
      chat_id: emulator.chat.id,
      draft_id: 1
    })

    expect(emulator.draft).toEqual({ draft_id: 1, thinking: true })
  })

  it("streams text updates and emits draft events", async () => {
    const emulator = makeTgBotEmulator()
    const drafts: string[] = []
    emulator.subscribe((e) => {
      if (e.type === "draft") drafts.push(e.draft.text ?? "…")
    })

    await emulator.client.execute("send_message_draft", {
      chat_id: emulator.chat.id,
      draft_id: 7,
      text: "Once"
    })
    await emulator.client.execute("send_message_draft", {
      chat_id: emulator.chat.id,
      draft_id: 7,
      text: "Once upon a time"
    })

    expect(drafts).toEqual(["Once", "Once upon a time"])
    expect(emulator.draft?.text).toBe("Once upon a time")
  })

  it("parses HTML in drafts", async () => {
    const emulator = makeTgBotEmulator()
    await emulator.client.execute("send_message_draft", {
      chat_id: emulator.chat.id,
      draft_id: 1,
      text: "<b>bold</b> part",
      parse_mode: "HTML"
    })

    expect(emulator.draft).toMatchObject({
      text: "bold part",
      entities: [{ type: "bold", offset: 0, length: 4 }]
    })
  })

  it("a sent message finalizes the draft", async () => {
    const emulator = makeTgBotEmulator()
    const events: string[] = []
    emulator.subscribe((e) => events.push(e.type))

    await emulator.client.execute("send_message_draft", {
      chat_id: emulator.chat.id,
      draft_id: 1,
      text: "partial…"
    })
    await emulator.client.execute("send_message", {
      chat_id: emulator.chat.id,
      text: "final answer"
    })

    expect(emulator.draft).toBeNull()
    expect(events).toEqual(["draft", "draft_cleared", "message"])
  })

  it("rejects a zero draft_id", async () => {
    const emulator = makeTgBotEmulator()
    const result = await emulator.client.executeSafe("send_message_draft", {
      chat_id: emulator.chat.id,
      draft_id: 0
    })

    expect(result).toMatchObject({ ok: false, error: { _tag: "NotOkResponse", errorCode: 400 } })
  })
})

describe("send_rich_message_draft", () => {
  it("streams rich blocks", async () => {
    const emulator = makeTgBotEmulator()
    await emulator.client.execute("send_rich_message_draft", {
      chat_id: emulator.chat.id,
      draft_id: 2,
      rich_message: { blocks: [{ type: "paragraph", text: "streaming…" as any }] }
    })

    expect(emulator.draft?.thinking).toBe(false)
    expect(emulator.draft?.rich_message?.blocks).toEqual([
      { type: "paragraph", text: "streaming…" }
    ])
  })

  it("empty blocks mean thinking", async () => {
    const emulator = makeTgBotEmulator()
    await emulator.client.execute("send_rich_message_draft", {
      chat_id: emulator.chat.id,
      draft_id: 2,
      rich_message: { blocks: [] }
    })

    expect(emulator.draft?.thinking).toBe(true)
  })
})

describe("send_rich_message", () => {
  it("passes blocks through and clears the draft", async () => {
    const emulator = makeTgBotEmulator()
    await emulator.client.execute("send_message_draft", {
      chat_id: emulator.chat.id,
      draft_id: 1
    })

    const message = await emulator.client.execute("send_rich_message", {
      chat_id: emulator.chat.id,
      rich_message: {
        blocks: [
          { type: "heading", text: "Title" as any, size: 1 },
          { type: "paragraph", text: "Body" as any }
        ]
      }
    })

    expect(emulator.draft).toBeNull()
    expect(message.rich_message?.blocks).toHaveLength(2)
  })

  it("converts html into blocks", async () => {
    const emulator = makeTgBotEmulator()
    const message = await emulator.client.execute("send_rich_message", {
      chat_id: emulator.chat.id,
      rich_message: { html: 'Intro <b>bold</b>\n<pre language="ts">const a = 1</pre>' }
    })

    expect(message.rich_message?.blocks).toEqual([
      { type: "paragraph", text: ["Intro ", { type: "bold", text: "bold" }] },
      { type: "pre", text: "const a = 1", language: "ts" }
    ])
  })

  it("rejects markdown input", async () => {
    const emulator = makeTgBotEmulator()
    const result = await emulator.client.executeSafe("send_rich_message", {
      chat_id: emulator.chat.id,
      rich_message: { markdown: "# nope" }
    })

    expect(result).toMatchObject({ ok: false, error: { _tag: "NotOkResponse", errorCode: 400 } })
  })

  it("edit_message_text can replace content with a rich message", async () => {
    const emulator = makeTgBotEmulator()
    const sent = await emulator.client.execute("send_message", {
      chat_id: emulator.chat.id,
      text: "plain"
    })

    await emulator.client.execute("edit_message_text", {
      chat_id: emulator.chat.id,
      message_id: sent.message_id,
      rich_message: { blocks: [{ type: "paragraph", text: "rich now" as any }] }
    })

    expect(emulator.messages[0].rich_message?.blocks).toEqual([
      { type: "paragraph", text: "rich now" }
    ])
  })
})
