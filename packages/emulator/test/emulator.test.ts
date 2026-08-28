import { describe, expect, it } from "vitest"

import { makeTgBotEmulator } from "~/emulator"

describe("get_updates", () => {
  it("returns pending updates immediately without a timeout", async () => {
    const emulator = makeTgBotEmulator()
    emulator.sendMessage("hi")

    const updates = await emulator.client.execute("get_updates", {})

    expect(updates).toHaveLength(1)
    expect(updates[0].message?.text).toBe("hi")
  })

  it("returns [] immediately when queue is empty and timeout is 0", async () => {
    const emulator = makeTgBotEmulator()
    const updates = await emulator.client.execute("get_updates", {})
    expect(updates).toEqual([])
  })

  it("long-polls until an update arrives", async () => {
    const emulator = makeTgBotEmulator()

    const pending = emulator.client.execute("get_updates", { timeout: 10 })
    setTimeout(() => emulator.sendMessage("wake up"), 20)

    const updates = await pending
    expect(updates).toHaveLength(1)
    expect(updates[0].message?.text).toBe("wake up")
  })

  it("confirms updates via offset", async () => {
    const emulator = makeTgBotEmulator()
    emulator.sendMessage("one")
    emulator.sendMessage("two")

    const first = await emulator.client.execute("get_updates", {})
    expect(first).toHaveLength(2)

    const lastId = first[first.length - 1].update_id
    const confirmed = await emulator.client.execute("get_updates", { offset: lastId + 1 })
    expect(confirmed).toEqual([])

    // confirmed updates are gone for good
    const again = await emulator.client.execute("get_updates", {})
    expect(again).toEqual([])
  })
})

describe("messages", () => {
  it("user commands get a bot_command entity", () => {
    const emulator = makeTgBotEmulator()
    const message = emulator.sendMessage("/start now")

    expect(message.entities).toEqual([{ type: "bot_command", offset: 0, length: 6 }])
  })

  it("send_message stores a bot message and emits an event", async () => {
    const emulator = makeTgBotEmulator()
    const events: string[] = []
    emulator.subscribe((e) => events.push(e.type))

    const message = await emulator.client.execute("send_message", {
      chat_id: emulator.chat.id,
      text: "hello from bot"
    })

    expect(message.from?.id).toBe(emulator.bot.id)
    expect(emulator.messages.map((m) => m.text)).toEqual(["hello from bot"])
    expect(events).toEqual(["message"])
  })

  it("edit_message_text updates the stored message", async () => {
    const emulator = makeTgBotEmulator()
    const sent = await emulator.client.execute("send_message", {
      chat_id: emulator.chat.id,
      text: "before"
    })

    await emulator.client.execute("edit_message_text", {
      chat_id: emulator.chat.id,
      message_id: sent.message_id,
      text: "after"
    })

    expect(emulator.messages[0].text).toBe("after")
  })

  it("delete_message removes the message; deleting again fails", async () => {
    const emulator = makeTgBotEmulator()
    const sent = await emulator.client.execute("send_message", {
      chat_id: emulator.chat.id,
      text: "to be deleted"
    })

    await emulator.client.execute("delete_message", {
      chat_id: emulator.chat.id,
      message_id: sent.message_id
    })
    expect(emulator.messages).toEqual([])

    const result = await emulator.client.executeSafe("delete_message", {
      chat_id: emulator.chat.id,
      message_id: sent.message_id
    })
    expect(result.ok).toBe(false)
  })

  it("unknown methods produce a NotOkResponse", async () => {
    const emulator = makeTgBotEmulator()
    const result = await emulator.client.executeSafe("send_poll", {
      chat_id: emulator.chat.id,
      question: "?",
      options: []
    })

    expect(result).toMatchObject({
      ok: false,
      error: { _tag: "NotOkResponse", errorCode: 404 }
    })
  })
})

describe("parse_mode HTML", () => {
  it("strips tags into entities", async () => {
    const emulator = makeTgBotEmulator()
    const message = await emulator.client.execute("send_message", {
      chat_id: emulator.chat.id,
      text: "<b>bold</b> and <code>x = 1</code>",
      parse_mode: "HTML"
    })

    expect(message.text).toBe("bold and x = 1")
    expect(message.entities).toEqual([
      { type: "bold", offset: 0, length: 4 },
      { type: "code", offset: 9, length: 5 }
    ])
  })

  it("supports pre with a language and decodes html entities", async () => {
    const emulator = makeTgBotEmulator()
    const message = await emulator.client.execute("send_message", {
      chat_id: emulator.chat.id,
      text: '<pre language="json">{"a": "&lt;b&gt;"}</pre>',
      parse_mode: "HTML"
    })

    expect(message.text).toBe('{"a": "<b>"}')
    expect(message.entities).toEqual([{ type: "pre", offset: 0, length: 12, language: "json" }])
  })

  it("keeps unknown tags as literal text", async () => {
    const emulator = makeTgBotEmulator()
    const message = await emulator.client.execute("send_message", {
      chat_id: emulator.chat.id,
      text: "a <video>b</video>",
      parse_mode: "HTML"
    })

    expect(message.text).toBe("a <video>b</video>")
    expect(message.entities).toBeUndefined()
  })

  it("links get a text_link entity with the url", async () => {
    const emulator = makeTgBotEmulator()
    const message = await emulator.client.execute("send_message", {
      chat_id: emulator.chat.id,
      text: 'see <a href="https://example.com">docs</a>',
      parse_mode: "HTML"
    })

    expect(message.entities).toEqual([
      { type: "text_link", offset: 4, length: 4, url: "https://example.com" }
    ])
  })

  it("edit_message_text re-parses entities", async () => {
    const emulator = makeTgBotEmulator()
    const sent = await emulator.client.execute("send_message", {
      chat_id: emulator.chat.id,
      text: "<b>old</b>",
      parse_mode: "HTML"
    })

    const edited = await emulator.client.execute("edit_message_text", {
      chat_id: emulator.chat.id,
      message_id: sent.message_id,
      text: "plain now"
    })

    expect(edited).toMatchObject({ text: "plain now" })
    expect(emulator.messages[0].entities).toBeUndefined()
  })
})

describe("tapButton", () => {
  const keyboard = {
    inline_keyboard: [[{ text: "Go", callback_data: "go" }]]
  }

  it("synthesizes a callback_query update for the latest matching message", async () => {
    const emulator = makeTgBotEmulator()
    const sent = await emulator.client.execute("send_message", {
      chat_id: emulator.chat.id,
      text: "menu",
      reply_markup: keyboard
    })

    const query = emulator.tapButton("go")
    expect(query.data).toBe("go")
    expect(query.message).toMatchObject({ message_id: sent.message_id })

    const updates = await emulator.client.execute("get_updates", {})
    expect(updates[0].callback_query?.data).toBe("go")
  })

  it("throws when no message has the button", () => {
    const emulator = makeTgBotEmulator()
    expect(() => emulator.tapButton("missing")).toThrow(/no message has a button/)
  })
})

describe("integration with bot.run()", () => {
  it("runs a real bot loop end to end: command, reply, button tap, edit", async () => {
    const { createBot } = await import("@effect-ak/tg-bot")
    const emulator = makeTgBotEmulator()

    const instance = await createBot()
      .command("/start", ({ ctx }) =>
        ctx.reply("Pick one", {
          reply_markup: { inline_keyboard: [[{ text: "Red", callback_data: "color:red" }]] }
        })
      )
      .onCallback(/^color:/, ({ payload, ctx }) =>
        ctx.editMessageText(`You picked ${payload.data?.split(":")[1]}`)
      )
      .run({ client: emulator.client, logger: silentLogger })

    try {
      emulator.sendMessage("/start")
      const menu = await emulator.nextBotMessage()
      expect(menu.text).toBe("Pick one")

      const edited = emulator.nextEvent((e) => e.type === "message_edited")
      const answered = emulator.nextEvent((e) => e.type === "callback_answered")
      emulator.tapButton("color:red")

      await answered
      await edited
      expect(emulator.messages.at(-1)?.text).toBe("You picked red")
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

describe("ctx.stream integration", () => {
  it("streams drafts and finalizes through a real bot loop", async () => {
    const { createBot } = await import("@effect-ak/tg-bot")
    const emulator = makeTgBotEmulator()

    const instance = await createBot()
      .onText(({ payload, ctx }) => ctx.stream(["Echo: ", payload.text ?? ""], { interval_ms: 0 }))
      .run({ client: emulator.client, logger: silentLogger })

    try {
      const drafts: string[] = []
      emulator.subscribe((e) => {
        if (e.type === "draft") drafts.push(e.draft.thinking ? "…" : (e.draft.text ?? ""))
      })

      emulator.sendMessage("stream me")
      const final = await emulator.nextBotMessage()

      expect(final.text).toBe("Echo: stream me")
      expect(drafts).toEqual(["…", "Echo: ", "Echo: stream me"])
      expect(emulator.draft).toBeNull()
    } finally {
      instance.stop()
    }
  })
})
