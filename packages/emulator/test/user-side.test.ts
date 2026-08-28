import { describe, expect, it } from "vitest"

import { makeTgBotEmulator } from "~/emulator"

const bytes = (text: string) => new TextEncoder().encode(text)

describe("user media", () => {
  it("sendDocument delivers an update and the bytes round-trip", async () => {
    const emulator = makeTgBotEmulator()
    emulator.sendDocument(
      { file_content: bytes("user file"), file_name: "notes.txt" },
      { caption: "my notes" }
    )

    const updates = await emulator.client.execute("get_updates", {})
    const message = updates[0].message!
    expect(message.document?.file_name).toBe("notes.txt")
    expect(message.caption).toBe("my notes")

    const file = await emulator.client.getFile({ fileId: message.document!.file_id })
    expect(new TextDecoder().decode(file.content)).toBe("user file")
  })

  it("sendPhoto delivers a photo update", async () => {
    const emulator = makeTgBotEmulator()
    emulator.sendPhoto({ file_content: bytes("png"), file_name: "pic.png" })

    const updates = await emulator.client.execute("get_updates", {})
    expect(updates[0].message?.photo?.[0]?.file_id).toMatch(/^emu-file-/)
  })
})

describe("user edits", () => {
  it("editMessage updates history and delivers edited_message", async () => {
    const emulator = makeTgBotEmulator()
    const sent = emulator.sendMessage("typo")
    await emulator.client.execute("get_updates", { offset: 1_000_000 }) // drain

    const edited = emulator.editMessage(sent.message_id, "fixed")
    expect(edited.edit_date).toBeDefined()
    expect(emulator.messages[0].text).toBe("fixed")

    const updates = await emulator.client.execute("get_updates", {})
    expect(updates[0].edited_message?.text).toBe("fixed")
  })

  it("refuses to edit the bot's messages", async () => {
    const emulator = makeTgBotEmulator()
    const botMessage = await emulator.client.execute("send_message", {
      chat_id: emulator.chat.id,
      text: "bot said this"
    })

    expect(() => emulator.editMessage(botMessage.message_id, "hacked")).toThrow(/own messages/)
  })
})

describe("user reactions", () => {
  it("react delivers message_reaction with old and new reactions", async () => {
    const emulator = makeTgBotEmulator()
    const message = await emulator.client.execute("send_message", {
      chat_id: emulator.chat.id,
      text: "react to me"
    })

    emulator.react(message.message_id, "👍")
    emulator.react(message.message_id, "🔥")
    emulator.react(message.message_id, null)

    const updates = await emulator.client.execute("get_updates", {})
    const reactions = updates.map((u) => u.message_reaction!)
    expect(reactions[0]).toMatchObject({
      message_id: message.message_id,
      old_reaction: [],
      new_reaction: [{ type: "emoji", emoji: "👍" }]
    })
    expect(reactions[1].old_reaction).toEqual([{ type: "emoji", emoji: "👍" }])
    expect(reactions[2].new_reaction).toEqual([])
    expect(emulator.reactions[message.message_id]).toBeUndefined()
  })
})

describe("inline mode", () => {
  it("query → answer → choose delivers the full round trip", async () => {
    const emulator = makeTgBotEmulator()
    const query = emulator.sendInlineQuery("cats")

    await emulator.client.execute("answer_inline_query", {
      inline_query_id: query.id,
      results: [
        {
          type: "article",
          id: "r1",
          title: "A cat article",
          input_message_content: { message_text: "Here is a cat 🐈" }
        }
      ]
    })
    expect(emulator.inlineResults).toHaveLength(1)

    const chosen = emulator.chooseInlineResult("r1")
    expect(chosen).toMatchObject({ result_id: "r1", query: "cats" })
    expect(emulator.messages.at(-1)?.text).toBe("Here is a cat 🐈")

    const updates = await emulator.client.execute("get_updates", {})
    const types = updates.map((u) => Object.keys(u).find((k) => k !== "update_id"))
    expect(types).toEqual(["inline_query", "chosen_inline_result", "message"])
  })

  it("answering an unknown query id fails like the real API", async () => {
    const emulator = makeTgBotEmulator()
    const result = await emulator.client.executeSafe("answer_inline_query", {
      inline_query_id: "stale",
      results: []
    })

    expect(result).toMatchObject({ ok: false, error: { _tag: "NotOkResponse", errorCode: 400 } })
  })
})

describe("bot handles user-side updates end to end", () => {
  it("a real bot reacts to message_reaction and edited_message", async () => {
    const { createBot } = await import("@effect-ak/tg-bot")
    const emulator = makeTgBotEmulator()

    const instance = await createBot()
      .on("message_reaction", ({ fallback }) => [
        fallback(({ payload, ctx }) => {
          const emoji = payload.new_reaction[0]
          return ctx.reply(`Thanks for the ${emoji && "emoji" in emoji ? emoji.emoji : "?"}!`)
        })
      ])
      .run({ client: emulator.client, logger: silentLogger })

    try {
      const message = emulator.sendMessage("hello")
      emulator.react(message.message_id, "👍")

      const reply = await emulator.nextBotMessage()
      expect(reply.text).toBe("Thanks for the 👍!")
    } finally {
      instance.stop()
    }
  })
})

const silentLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {}
}

describe("user reply and delete", () => {
  it("sendMessage with reply_to embeds reply_to_message", async () => {
    const emulator = makeTgBotEmulator()
    const original = await emulator.client.execute("send_message", {
      chat_id: emulator.chat.id,
      text: "original"
    })

    emulator.sendMessage("my answer", { reply_to: original.message_id })

    const updates = await emulator.client.execute("get_updates", {})
    expect(updates[0].message?.reply_to_message?.message_id).toBe(original.message_id)
  })

  it("deleteMessage removes it from the chat without an update", async () => {
    const emulator = makeTgBotEmulator()
    const message = emulator.sendMessage("oops")
    await emulator.client.execute("get_updates", { offset: 1_000_000 }) // drain

    const events: string[] = []
    emulator.subscribe((e) => events.push(e.type))
    emulator.deleteMessage(message.message_id)

    expect(emulator.messages).toEqual([])
    expect(events).toEqual(["message_deleted"])
    const updates = await emulator.client.execute("get_updates", {})
    expect(updates).toEqual([])
  })
})
