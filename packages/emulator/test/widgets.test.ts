import { describe, expect, it } from "vitest"

import { makeTgBotEmulator } from "~/index"

const silentLogger = { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} }

const sendWidget = (
  emulator: ReturnType<typeof makeTgBotEmulator>,
  input: {
    allow_queries?: boolean
    is_shared?: boolean
    public_data?: string
    chat_data?: string
  } = {}
) =>
  emulator.client.execute("send_widget", {
    chat_id: emulator.chat.id,
    html: "<button>Vote</button>",
    ...input
  })

describe("sending widgets", () => {
  it("stores a widget message, protected like in production", async () => {
    const emulator = makeTgBotEmulator()
    const message = await sendWidget(emulator, { chat_data: "{}" })
    expect(message.widget).toEqual({ html: "<button>Vote</button>", chat_data: "{}" })
    expect(message.has_protected_content).toBe(true)
  })

  it("checks the documented size limits", async () => {
    const emulator = makeTgBotEmulator()
    const tooBig = await emulator.client.executeSafe("send_widget", {
      chat_id: emulator.chat.id,
      html: "x".repeat(32769)
    })
    expect(tooBig).toMatchObject({ ok: false, error: { errorCode: 400 } })
    const bigData = await emulator.client.executeSafe("send_widget", {
      chat_id: emulator.chat.id,
      html: "<p>x</p>",
      chat_data: "x".repeat(1025)
    })
    expect(bigData).toMatchObject({ ok: false, error: { errorCode: 400 } })
  })

  it("a shared widget gets an id and can be sent again", async () => {
    const emulator = makeTgBotEmulator()
    const first = await sendWidget(emulator, { is_shared: true, public_data: "p1" })
    const widget_id = first.widget?.id
    expect(widget_id).toBeDefined()

    const again = await emulator.client.execute("send_shared_widget", {
      chat_id: emulator.chat.id,
      widget_id: widget_id!,
      chat_data: "c2"
    })
    expect(again.widget).toMatchObject({
      id: widget_id,
      html: "<button>Vote</button>",
      public_data: "p1",
      chat_data: "c2"
    })

    const unknown = await emulator.client.executeSafe("send_shared_widget", {
      chat_id: emulator.chat.id,
      widget_id: "nope"
    })
    expect(unknown).toMatchObject({ ok: false, error: { errorCode: 400 } })
  })

  it("widget messages can't be copied or forwarded", async () => {
    const emulator = makeTgBotEmulator()
    const message = await sendWidget(emulator)
    const target = {
      chat_id: emulator.chat.id,
      from_chat_id: emulator.chat.id,
      message_id: message.message_id
    }
    expect(await emulator.client.executeSafe("copy_message", target)).toMatchObject({ ok: false })
    expect(await emulator.client.executeSafe("forward_message", target)).toMatchObject({
      ok: false
    })
  })
})

describe("changing a widget's state", () => {
  it("sets and removes chat data, and refuses a change that changes nothing", async () => {
    const emulator = makeTgBotEmulator()
    const message = await sendWidget(emulator)
    const target = { chat_id: emulator.chat.id, message_id: message.message_id }

    const changed = emulator.nextEvent((e) => e.type === "widget_data_changed")
    await emulator.client.execute("edit_message_widget_data", { ...target, chat_data: "turn:x" })
    expect(await changed).toMatchObject({
      message_id: message.message_id,
      widget: { chat_data: "turn:x" }
    })

    const same = await emulator.client.executeSafe("edit_message_widget_data", {
      ...target,
      chat_data: "turn:x"
    })
    expect(same).toMatchObject({
      ok: false,
      error: { details: "Bad Request: message is not modified" }
    })

    await emulator.client.execute("edit_message_widget_data", { ...target, chat_data: "" })
    expect(emulator.messages.at(-1)?.widget).not.toHaveProperty("chat_data")
  })

  it("a shared widget's public data changes in every message that shows it", async () => {
    const emulator = makeTgBotEmulator()
    const first = await sendWidget(emulator, { is_shared: true, public_data: "v1" })
    const widget_id = first.widget!.id!
    await emulator.client.execute("send_shared_widget", { chat_id: emulator.chat.id, widget_id })

    await emulator.client.execute("edit_shared_widget_data", { widget_id, public_data: "v2" })
    expect(emulator.messages.map((m) => m.widget?.public_data)).toEqual(["v2", "v2"])

    await emulator.client.execute("edit_message_widget_data", {
      chat_id: emulator.chat.id,
      message_id: first.message_id,
      public_data: "v3"
    })
    expect(emulator.messages.map((m) => m.widget?.public_data)).toEqual(["v3", "v3"])
  })
})

describe("widget requests", () => {
  it("is NOT_ALLOWED for a widget sent without allow_queries", async () => {
    const emulator = makeTgBotEmulator()
    const message = await sendWidget(emulator)
    expect(await emulator.widgetRequest(message.message_id, "hi")).toEqual({
      ok: false,
      code: "NOT_ALLOWED"
    })
  })

  it("throws for a message without a widget, or data outside 1-64 bytes", async () => {
    const emulator = makeTgBotEmulator()
    const text = emulator.sendMessage("hello")
    expect(() => emulator.widgetRequest(text.message_id, "x")).toThrow(/has no widget/)
    const message = await sendWidget(emulator, { allow_queries: true })
    expect(() => emulator.widgetRequest(message.message_id, "")).toThrow(/1-64 bytes/)
    expect(() => emulator.widgetRequest(message.message_id, "x".repeat(65))).toThrow(/1-64 bytes/)
  })

  it("ends in TIMEOUT when the bot does not answer, and is BUSY meanwhile", async () => {
    const emulator = makeTgBotEmulator()
    const message = await sendWidget(emulator, { allow_queries: true })
    const pending = emulator.widgetRequest(message.message_id, "a", { timeout: 20 })
    expect(await emulator.widgetRequest(message.message_id, "b")).toEqual({
      ok: false,
      code: "BUSY"
    })
    expect(await pending).toEqual({ ok: false, code: "TIMEOUT" })
  })

  it("an answer over 1024 bytes fails for the bot and is INVALID_ANSWER for the widget", async () => {
    const emulator = makeTgBotEmulator()
    const message = await sendWidget(emulator, { allow_queries: true })
    const outcome = emulator.widgetRequest(message.message_id, "q")
    const [update] = await emulator.client.execute("get_updates", {})
    const answered = await emulator.client.executeSafe("answer_widget_query", {
      widget_query_id: update!.widget_query!.id,
      data: "x".repeat(1025)
    })
    expect(answered).toMatchObject({ ok: false, error: { errorCode: 400 } })
    expect(await outcome).toEqual({ ok: false, code: "INVALID_ANSWER" })
  })

  it("round-trips through a real bot: the answer reaches the widget, the state changes", async () => {
    const { createBot } = await import("@effect-ak/tg-bot")
    const emulator = makeTgBotEmulator()
    const instance = await createBot()
      .onWidgetQuery(({ data }) => [
        data(/^vote:/, ({ payload, ctx }) => [
          ctx.editWidgetData({ chat_data: payload.data }),
          ctx.answerWidgetQuery(`counted ${payload.data}`)
        ])
      ])
      .run({ client: emulator.client, logger: silentLogger })

    try {
      const message = await sendWidget(emulator, { allow_queries: true })
      const outcome = await emulator.widgetRequest(message.message_id, "vote:2")
      expect(outcome).toEqual({ ok: true, result: "counted vote:2" })
      expect(emulator.messages.at(-1)?.widget?.chat_data).toBe("vote:2")
    } finally {
      instance.stop()
    }
  })

  it("a handler that does not answer gets an empty answer sent for it", async () => {
    const { createBot } = await import("@effect-ak/tg-bot")
    const emulator = makeTgBotEmulator()
    const instance = await createBot()
      .onWidgetQuery(({ fallback }) => [fallback(({ ctx }) => ctx.reply("noted"))])
      .run({ client: emulator.client, logger: silentLogger })

    try {
      const message = await sendWidget(emulator, { allow_queries: true })
      expect(await emulator.widgetRequest(message.message_id, "x")).toEqual({
        ok: true,
        result: null
      })
    } finally {
      instance.stop()
    }
  })
})
