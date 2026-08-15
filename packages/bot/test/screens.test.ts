import type { Update } from "@effect-ak/tg-bot-api"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createBot } from "~/bot-builder"
import { defineScreens } from "~/screens"
import type { ScreenStore } from "~/screens"

const TOKEN = "TEST_TOKEN"
const silentLogger = { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} }

const okResponse = (result: unknown = { message_id: 1 }) =>
  new Response(JSON.stringify({ ok: true, result }), {
    status: 200,
    headers: { "content-type": "application/json" }
  })

const startUpdate = (): Update =>
  ({
    update_id: 1,
    message: {
      chat: { id: 99, type: "private" },
      date: 0,
      message_id: 1,
      text: "/start",
      entities: [{ type: "bot_command", offset: 0, length: 6 }]
    }
  }) as Update

const tap = (data: string): Update =>
  ({
    update_id: 2,
    callback_query: {
      id: "cb",
      from: { id: 1, is_bot: false, first_name: "A" },
      chat_instance: "x",
      data,
      message: { chat: { id: 99, type: "private" }, date: 0, message_id: 7 }
    }
  }) as Update

const send = (handler: (req: Request) => Promise<Response>, update: Update) =>
  handler(
    new Request("https://example.test/webhook", {
      method: "POST",
      body: JSON.stringify(update),
      headers: { "content-type": "application/json" }
    })
  )

const decode = (init: RequestInit | undefined) => {
  const out: Record<string, string> = {}
  ;(init!.body as FormData).forEach((v, k) => {
    if (typeof v === "string") out[k] = v
  })
  return out
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const calls = (spy: any) =>
  (spy.mock.calls as [string, RequestInit][]).map(([url, init]) => ({
    method: url.slice(url.lastIndexOf("/") + 1),
    body: decode(init)
  }))

const keyboardOf = (body: Record<string, string>) =>
  JSON.parse(body.reply_markup!).inline_keyboard as {
    text: string
    callback_data?: string
    url?: string
  }[][]

const screens = defineScreens({
  root: {
    text: "Main",
    buttons: [
      [
        { label: "Hours", next: "hours" },
        { label: "Site", url: "https://x.test" }
      ]
    ]
  },
  hours: {
    text: "Mon-Fri",
    parent: "root",
    buttons: [{ label: "Ping", action: ({ ctx }) => ctx.answerCallbackQuery({ text: "pong" }) }]
  },
  deep: { text: "Deep", parent: "hours" }
})

describe("defineScreens", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any
  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(okResponse())
  })
  afterEach(() => fetchSpy.mockRestore())

  const bot = () => createBot().use(screens).webhook({ bot_token: TOKEN, logger: silentLogger })

  it("/start sends the start screen with rendered buttons", async () => {
    await send(bot(), startUpdate())
    const [c] = calls(fetchSpy)
    expect(c!.method).toBe("sendMessage")
    expect(c!.body.text).toBe("Main")
    expect(keyboardOf(c!.body)).toEqual([
      [
        { text: "Hours", callback_data: "s:g:root:hours" },
        { text: "Site", url: "https://x.test" }
      ]
    ])
  })

  it("navigating edits the message in place and appends Back for screens with a parent", async () => {
    await send(bot(), tap("s:g:root:hours"))
    const c = calls(fetchSpy)
    expect(c.map((x) => x.method)).toEqual(["answerCallbackQuery", "editMessageText"])
    const edit = c[1]!.body
    expect(edit.chat_id).toBe("99")
    expect(edit.message_id).toBe("7")
    expect(edit.text).toBe("Mon-Fri")
    expect(keyboardOf(edit)).toEqual([
      [{ text: "Ping", callback_data: "s:a:hours:0" }],
      [{ text: "‹ Back", callback_data: "s:b:hours" }]
    ])
  })

  it("Back goes to the static parent when there is no store", async () => {
    await send(bot(), tap("s:b:hours"))
    expect(calls(fetchSpy)[1]!.body.text).toBe("Main")
  })

  it("action buttons run their handler", async () => {
    await send(bot(), tap("s:a:hours:0"))
    const c = calls(fetchSpy)
    expect(c).toHaveLength(1)
    expect(c[0]!.method).toBe("answerCallbackQuery")
    expect(c[0]!.body.text).toBe("pong")
  })

  it("unknown screen ids fall back to the start screen", async () => {
    await send(bot(), tap("s:g:root:nope"))
    expect(calls(fetchSpy)[1]!.body.text).toBe("Main")
  })

  it("ignores callback data without the prefix", async () => {
    await send(bot(), tap("other"))
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("supports dynamic text, footer, custom back label and onEnter", async () => {
    const entered: string[] = []
    const dyn = defineScreens(
      {
        a: { text: ({ payload }) => `chat ${"chat" in payload ? payload.chat.id : "?"}` },
        b: { text: "B", parent: "a" }
      },
      {
        back: "Назад",
        footer: [{ label: "Help", url: "https://help.test" }],
        onEnter: (id) => void entered.push(id)
      }
    )
    const h = createBot().use(dyn).webhook({ bot_token: TOKEN, logger: silentLogger })
    await send(h, startUpdate())
    await send(h, tap("s:g:a:b"))
    const c = calls(fetchSpy)
    expect(c[0]!.body.text).toBe("chat 99")
    expect(keyboardOf(c[0]!.body)).toEqual([[{ text: "Help", url: "https://help.test" }]])
    expect(keyboardOf(c[2]!.body)).toEqual([
      [{ text: "Назад", callback_data: "s:b:b" }],
      [{ text: "Help", url: "https://help.test" }]
    ])
    expect(entered).toEqual(["a", "b"])
  })

  it("with a store, Back undoes the last step instead of using parent", async () => {
    const mem = new Map<number, readonly string[]>()
    const store: ScreenStore = {
      get: async (id) => mem.get(id),
      set: async (id, stack) => void mem.set(id, stack)
    }
    const s = defineScreens(
      {
        root: { text: "R", buttons: [{ label: "D", next: "deep" }] },
        hours: { text: "H", parent: "root", buttons: [{ label: "D", next: "deep" }] },
        deep: { text: "Deep", parent: "hours" }
      },
      { store }
    )
    const h = createBot().use(s).webhook({ bot_token: TOKEN, logger: silentLogger })

    // root -> deep (skipping hours); Back must return to root, not to parent `hours`
    await send(h, tap("s:g:root:deep"))
    expect(mem.get(99)).toEqual(["root"])
    await send(h, tap("s:b:deep"))
    const c = calls(fetchSpy)
    expect(c[3]!.body.text).toBe("R")
    expect(mem.get(99)).toEqual([])
  })

  it("open() can be used as a custom entry point and messageHandlers are exposed", async () => {
    const h = createBot()
      .onMessage(({ command }) => [command("/menu", screens.open("hours"))])
      .webhook({ bot_token: TOKEN, logger: silentLogger })
    const u = startUpdate()
    ;(u.message as { text: string }).text = "/menu"
    ;(u.message as { entities: { length: number }[] }).entities[0]!.length = 5
    await send(h, u)
    expect(calls(fetchSpy)[0]!.body.text).toBe("Mon-Fri")
    expect(screens.messageHandlers).toHaveLength(1)
    expect(screens.ids).toEqual(["root", "hours", "deep"])
  })
})
