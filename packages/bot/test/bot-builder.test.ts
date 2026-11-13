import type { Message, Update } from "@effect-ak/tg-bot-api"
import { readFileSync } from "node:fs"
import * as Path from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createBot } from "~/bot-builder"
import { BotResponse, type AvailableUpdateTypes } from "~/types"

// ---------------------------------------------------------------------------
// End-to-end testing strategy
// ---------------------------------------------------------------------------
// The builder doesn't expose registered handlers. To exercise routing, we use
// the webhook handler (which runs the full pipeline) and spy on `global.fetch`
// to observe what the bot tried to send back. This validates:
//   - that guards run in registration order
//   - that the matching guard's response is dispatched correctly
//   - that non-matching guards are skipped
// ---------------------------------------------------------------------------

const TOKEN = "TEST_TOKEN"

const silentLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {}
}

const okResponse = (result: unknown = { message_id: 1 }) =>
  new Response(JSON.stringify({ ok: true, result }), {
    status: 200,
    headers: { "content-type": "application/json" }
  })

const messageUpdate = (overrides: Partial<Message> = {}): Update =>
  ({
    update_id: 1,
    message: {
      chat: { id: 99, type: "private" },
      date: 0,
      message_id: 1,
      ...overrides
    }
  }) as Update

const messageWithCommand = (cmd: string): Update =>
  messageUpdate({
    text: cmd,
    entities: [{ type: "bot_command", offset: 0, length: cmd.length }]
  })

const callbackQueryUpdate = (data: string): Update =>
  ({
    update_id: 2,
    callback_query: {
      id: "cb",
      from: { id: 1, is_bot: false, first_name: "A" },
      chat_instance: "x",
      data,
      message: {
        chat: { id: 99, type: "private" },
        date: 0,
        message_id: 1
      }
    }
  }) as Update

const inlineQueryUpdate = (query: string): Update =>
  ({
    update_id: 3,
    inline_query: {
      id: "iq",
      from: { id: 1, is_bot: false, first_name: "A" },
      query,
      offset: ""
    }
  }) as Update

type FetchCall = [string, RequestInit | undefined]
const fetchCalls = (spy: { mock: { calls: unknown[][] } }): FetchCall[] =>
  spy.mock.calls as unknown as FetchCall[]

const decodeFormData = (init: RequestInit | undefined) => {
  const body = init?.body
  if (!(body instanceof FormData)) return undefined
  const out: Record<string, string> = {}
  body.forEach((value, key) => {
    if (typeof value === "string") out[key] = value
  })
  return out
}

const lastUrl = (spy: { mock: { calls: unknown[][] } }) => {
  const calls = fetchCalls(spy)
  if (calls.length === 0) return undefined
  return calls[calls.length - 1]![0]
}

const sendUpdate = async (handler: (req: Request) => Promise<Response>, update: Update) => {
  const req = new Request("https://example.test/webhook", {
    method: "POST",
    body: JSON.stringify(update),
    headers: { "content-type": "application/json" }
  })
  return handler(req)
}

describe("createBot — message helpers via webhook", () => {
  // vi.spyOn(global, "fetch") returns a heavily overloaded type — keep it loose.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(okResponse())
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it("routes /start to its command handler and replies", async () => {
    const handler = createBot()
      .onMessage(({ command, fallback }) => [
        command("/start", ({ ctx }) => ctx.reply("hello")),
        fallback(({ ctx }) => ctx.reply("fallback"))
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    const res = await sendUpdate(handler, messageWithCommand("/start"))
    expect(res.status).toBe(200)

    expect(fetchCalls(fetchSpy)).toHaveLength(1)
    expect(lastUrl(fetchSpy)).toBe(`https://api.telegram.org/bot${TOKEN}/sendMessage`)
    expect(decodeFormData(fetchCalls(fetchSpy)[0]![1])).toMatchObject({
      chat_id: "99",
      text: "hello"
    })
  })

  it("falls through to fallback when no command matches", async () => {
    const handler = createBot()
      .onMessage(({ command, fallback }) => [
        command("/start", ({ ctx }) => ctx.reply("hello")),
        fallback(({ ctx }) => ctx.reply("fallback"))
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, messageUpdate({ text: "random words" }))

    expect(decodeFormData(fetchCalls(fetchSpy)[0]![1])).toMatchObject({
      text: "fallback"
    })
  })

  it("first matching guard wins; later guards are not evaluated", async () => {
    const calls: string[] = []
    const handler = createBot()
      .onMessage(({ text, fallback }) => [
        {
          match: ({ payload }) => {
            calls.push("first.match")
            return !!payload.text
          },
          handle: ({ ctx }) => {
            calls.push("first.handle")
            return ctx.reply("first")
          }
        },
        text(({ ctx }) => {
          calls.push("second.handle")
          return ctx.reply("second")
        }),
        fallback(({ ctx }) => {
          calls.push("fallback.handle")
          return ctx.reply("fallback")
        })
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, messageUpdate({ text: "hi" }))

    expect(calls).toEqual(["first.match", "first.handle"])
    expect(decodeFormData(fetchCalls(fetchSpy)[0]![1])).toMatchObject({
      text: "first"
    })
  })

  it("ignores update when no guard matches and no fallback is registered", async () => {
    const handler = createBot()
      .onMessage(({ command }) => [command("/start", ({ ctx }) => ctx.reply("hello"))])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, messageUpdate({ text: "random" }))

    // Only attempt at fetch should be... none, since no response was produced.
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("merges guards across chained onMessage calls", async () => {
    const handler = createBot()
      .onMessage(({ command }) => [command("/a", ({ ctx }) => ctx.reply("A"))])
      .onMessage(({ command }) => [command("/b", ({ ctx }) => ctx.reply("B"))])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, messageWithCommand("/b"))
    expect(decodeFormData(fetchCalls(fetchSpy)[0]![1])).toMatchObject({
      text: "B"
    })
  })

  it("dispatches replyWithDocument as send_document", async () => {
    const handler = createBot()
      .onMessage(({ command }) => [
        command("/file", ({ ctx }) =>
          ctx.replyWithDocument({
            file_content: new Uint8Array([1, 2, 3]),
            file_name: "x.bin"
          })
        )
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, messageWithCommand("/file"))

    expect(lastUrl(fetchSpy)).toBe(`https://api.telegram.org/bot${TOKEN}/sendDocument`)
  })

  // The shorthand's `type` picks the method; it is not a parameter of it.
  it("does not send the shorthand's `type` as a parameter", async () => {
    const handler = createBot()
      .onMessage(({ command }) => [command("/hi", ({ ctx }) => ctx.reply("hello"))])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, messageWithCommand("/hi"))

    const sent = decodeFormData(fetchCalls(fetchSpy)[0]?.[1])
    expect(sent).toMatchObject({ chat_id: "99", text: "hello" })
    expect(sent).not.toHaveProperty("type")
  })

  // `send_poll` has a `type` parameter of its own ("quiz" | "regular"):
  // `type=poll` used to reach Telegram and fail the call.
  it("sends a poll through the shorthand without a `type` parameter", async () => {
    const handler = createBot()
      .onMessage(({ command }) => [
        command("/poll", () =>
          BotResponse.make({
            type: "poll",
            question: "Q?",
            options: [{ text: "a" }, { text: "b" }]
          })
        )
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, messageWithCommand("/poll"))

    expect(lastUrl(fetchSpy)).toBe(`https://api.telegram.org/bot${TOKEN}/sendPoll`)
    const sent = decodeFormData(fetchCalls(fetchSpy)[0]?.[1])
    expect(sent).toMatchObject({ chat_id: "99", question: "Q?" })
    expect(sent).not.toHaveProperty("type")
  })

  it("text helper matches messages with text", async () => {
    const handler = createBot()
      .onMessage(({ text }) => [text(({ ctx }) => ctx.reply("got text"))])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, messageUpdate({ text: "hi" }))
    expect(decodeFormData(fetchCalls(fetchSpy)[0]![1])).toMatchObject({
      text: "got text"
    })
  })

  it("photo helper does not match a text-only message", async () => {
    const handler = createBot()
      .onMessage(({ photo }) => [photo(({ ctx }) => ctx.reply("photo"))])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, messageUpdate({ text: "no photo here" }))
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe("createBot — callback_query helpers", () => {
  // callback_query updates have no top-level `chat`, so the processor does not
  // auto-dispatch responses (see bot-processor.ts). We assert routing by
  // tracking which handler ran via a side-channel array.

  it("data helper matches by string equality", async () => {
    const seen: string[] = []
    const handler = createBot()
      .onCallbackQuery(({ data, fallback }) => [
        data("approve", () => {
          seen.push("approve")
          return BotResponse.ignore
        }),
        fallback(() => {
          seen.push("fallback")
          return BotResponse.ignore
        })
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, callbackQueryUpdate("approve"))
    await sendUpdate(handler, callbackQueryUpdate("other"))

    expect(seen).toEqual(["approve", "fallback"])
  })

  it("data helper matches by regex", async () => {
    const seen: string[] = []
    const handler = createBot()
      .onCallbackQuery(({ data }) => [
        data(/^item:(\d+)$/, () => {
          seen.push("item")
          return BotResponse.ignore
        }),
        data("nope", () => {
          seen.push("nope")
          return BotResponse.ignore
        })
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, callbackQueryUpdate("item:42"))
    expect(seen).toEqual(["item"])
  })
})

describe("createBot — inline_query helpers", () => {
  // vi.spyOn(global, "fetch") returns a heavily overloaded type — keep it loose.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(okResponse())
  })
  afterEach(() => fetchSpy.mockRestore())

  it("query helper matches by regex; fallback otherwise", async () => {
    // inline_query has no `chat`, so the response can't be auto-dispatched.
    // We assert the handler ran by checking that no fetch was attempted (since
    // there's nothing to send), and instead verify by capturing the response.
    const seen: string[] = []
    const handler = createBot()
      .onInlineQuery(({ query, fallback }) => [
        query(/^foo/, ({ payload }) => {
          seen.push(`foo:${payload.query}`)
          return BotResponse.ignore
        }),
        fallback(({ payload }) => {
          seen.push(`fallback:${payload.query}`)
          return BotResponse.ignore
        })
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, inlineQueryUpdate("foobar"))
    await sendUpdate(handler, inlineQueryUpdate("baz"))

    expect(seen).toEqual(["foo:foobar", "fallback:baz"])
  })
})

describe("createBot — multiple update types", () => {
  // vi.spyOn(global, "fetch") returns a heavily overloaded type — keep it loose.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(okResponse())
  })
  afterEach(() => fetchSpy.mockRestore())

  it("routes each update to its own handler", async () => {
    const seen: string[] = []
    const handler = createBot()
      .onMessage(({ command }) => [
        command("/start", () => {
          seen.push("message")
          return BotResponse.ignore
        })
      ])
      .onCallbackQuery(({ data }) => [
        data("ping", () => {
          seen.push("callback")
          return BotResponse.ignore
        })
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, messageWithCommand("/start"))
    await sendUpdate(handler, callbackQueryUpdate("ping"))

    expect(seen).toEqual(["message", "callback"])
  })

  it("ignores updates of types that have no registered handler", async () => {
    const handler = createBot()
      .onMessage(({ command }) => [command("/start", ({ ctx }) => ctx.reply("hello"))])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, callbackQueryUpdate("anything"))
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  // Every update kind the generated types know, each with a payload that has a
  // `type` field of its own: the handler for that kind receives the payload
  // untouched. A kind added by a new Bot API version is covered automatically.
  const updateKinds = (() => {
    const source = readFileSync(
      Path.resolve(import.meta.dirname, "../../api/src/specification/types.ts"),
      "utf-8"
    )
    const body = /export interface Update \{([\s\S]*?)\n\}/.exec(source)?.[1] ?? ""
    return [...body.matchAll(/^ {2}(\w+)\?:/gm)].map((m) => m[1] ?? "")
  })()

  it("knows the update kinds", () => {
    expect(updateKinds).toContain("message")
    expect(updateKinds).toContain("widget_query")
  })

  it.each(updateKinds)("routes a `%s` update to its handler, payload untouched", async (kind) => {
    const payload = { id: "x", type: { own: kind } }
    const received: unknown[] = []
    const handler = createBot()
      .on(kind as AvailableUpdateTypes, ({ fallback }) => [
        fallback(({ payload }) => {
          received.push(payload)
          return BotResponse.ignore
        })
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, { update_id: 1, [kind]: payload } as unknown as Update)

    expect(received).toEqual([payload])
  })

  // Payloads with a `type` field of their own: the update kind used to be
  // merged into the payload, so these never reached their handler.
  it("routes a poll update and hands over the poll's own `type`", async () => {
    const seen: string[] = []
    const handler = createBot()
      .on("poll", ({ fallback }) => [
        fallback(({ payload }) => {
          seen.push(payload.type)
          return BotResponse.ignore
        })
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, {
      update_id: 4,
      poll: { id: "p", question: "?", options: [], type: "quiz" }
    } as unknown as Update)

    expect(seen).toEqual(["quiz"])
  })

  const widgetQueryUpdate = (): Update =>
    ({
      update_id: 5,
      widget_query: {
        id: "wq",
        from: { id: 1, is_bot: false, first_name: "A" },
        chat: { id: 99, type: "private" },
        message_id: 7,
        chat_instance: "x",
        type: { type: "data" },
        data: "vote:2"
      }
    }) as Update

  it("routes a widget_query update, replies to its chat and answers the query", async () => {
    const seen: unknown[] = []
    const handler = createBot()
      .on("widget_query", ({ fallback }) => [
        fallback(({ payload, ctx }) => {
          seen.push(payload.type, payload.data)
          return [
            ctx.call("answer_widget_query", { widget_query_id: payload.id, data: "ok" }),
            ctx.reply("voted")
          ]
        })
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, widgetQueryUpdate())

    expect(seen).toEqual([{ type: "data" }, "vote:2"])
    const calls = fetchCalls(fetchSpy)
    expect(calls.map(([url]) => url.split("/").pop())).toEqual(["answerWidgetQuery", "sendMessage"])
    expect(decodeFormData(calls[0]![1])).toMatchObject({ widget_query_id: "wq", data: "ok" })
    expect(decodeFormData(calls[1]![1])).toMatchObject({ chat_id: "99", text: "voted" })
  })

  it("does not take a widget_query for a callback_query", async () => {
    const errors: string[] = []
    const handler = createBot()
      .on("widget_query", ({ fallback }) => [fallback(({ ctx }) => ctx.answerCallbackQuery())])
      .webhook({
        bot_token: TOKEN,
        logger: silentLogger,
        onHandleResult: (r) => {
          if (r.error) errors.push(r.error)
        }
      })

    await sendUpdate(handler, widgetQueryUpdate())

    expect(errors[0]).toMatch(/not a callback_query/)
    const urls = fetchCalls(fetchSpy).map(([url]) => url.split("/").pop())
    expect(urls).not.toContain("answerCallbackQuery")
  })

  it("routes a shared_widget_query update", async () => {
    const seen: string[] = []
    const handler = createBot()
      .on("shared_widget_query", ({ fallback }) => [
        fallback(({ payload }) => {
          seen.push(payload.widget_id)
          return BotResponse.ignore
        })
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, {
      update_id: 6,
      shared_widget_query: {
        id: "sq",
        from: { id: 1, is_bot: false, first_name: "A" },
        type: { type: "data" },
        data: "x",
        widget_id: "w1"
      }
    } as Update)

    expect(seen).toEqual(["w1"])
  })
})

describe("createBot — error handling", () => {
  // vi.spyOn(global, "fetch") returns a heavily overloaded type — keep it loose.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(okResponse())
  })
  afterEach(() => fetchSpy.mockRestore())

  it("sends an error reply when a handler throws", async () => {
    const handler = createBot()
      .onMessage(({ command }) => [
        command("/boom", () => {
          throw new Error("kaboom")
        })
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    const res = await sendUpdate(handler, messageWithCommand("/boom"))
    expect(res.status).toBe(200)

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const body = decodeFormData(fetchCalls(fetchSpy)[0]![1])
    expect(body?.text).toContain("BotHandlerError")
  })

  it("returns 500 if request body is not valid JSON", async () => {
    const handler = createBot()
      .onMessage(({ command }) => [command("/start", ({ ctx }) => ctx.reply("hi"))])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    const req = new Request("https://example.test/webhook", {
      method: "POST",
      body: "not json",
      headers: { "content-type": "text/plain" }
    })
    const res = await handler(req)
    expect(res.status).toBe(500)
  })

  it("returns 400 if the JSON body is not an Update", async () => {
    const seen: string[] = []
    const handler = createBot()
      .onMessage(({ fallback }) => [
        fallback(() => {
          seen.push("message")
          return BotResponse.ignore
        })
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    const req = new Request("https://example.test/webhook", {
      method: "POST",
      body: JSON.stringify({ message: { chat: { id: 1, type: "private" }, text: "forged" } }),
      headers: { "content-type": "application/json" }
    })
    const res = await handler(req)

    expect(res.status).toBe(400)
    expect(seen).toEqual([])
  })

  it("invokes onHandleResult with status=handled for matched updates", async () => {
    const results: Array<{ status: string; updateType: string }> = []
    const handler = createBot()
      .onMessage(({ command }) => [command("/start", ({ ctx }) => ctx.reply("hi"))])
      .webhook({
        bot_token: TOKEN,
        logger: silentLogger,
        onHandleResult: (r) => results.push(r)
      })

    await sendUpdate(handler, messageWithCommand("/start"))

    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({
      status: "handled",
      updateType: "message",
      responseType: "message"
    })
  })

  it("invokes onHandleResult with status=no_handler when no handler matches the update type", async () => {
    const results: Array<{ status: string }> = []
    const handler = createBot()
      .onMessage(({ command }) => [command("/start", ({ ctx }) => ctx.reply("hi"))])
      .webhook({
        bot_token: TOKEN,
        logger: silentLogger,
        onHandleResult: (r) => results.push(r)
      })

    await sendUpdate(handler, callbackQueryUpdate("ping"))

    expect(results[0]?.status).toBe("no_handler")
  })

  it("invokes onHandleResult with status=ignored when handler returns BotResponse.ignore", async () => {
    const results: Array<{ status: string }> = []
    const handler = createBot()
      .onMessage(({ command }) => [command("/silent", ({ ctx }) => ctx.ignore)])
      .webhook({
        bot_token: TOKEN,
        logger: silentLogger,
        onHandleResult: (r) => results.push(r)
      })

    await sendUpdate(handler, messageWithCommand("/silent"))

    expect(results[0]?.status).toBe("ignored")
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Callback query responses (answer / edit) and multi-action responses
// ---------------------------------------------------------------------------

const methodOf = (url: string) => url.slice(url.lastIndexOf("/") + 1)

describe("createBot — callback_query responses", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(okResponse(true))
  })
  afterEach(() => fetchSpy.mockRestore())

  it("editMessageText edits the message of the tapped keyboard and auto-answers the query", async () => {
    const handler = createBot()
      .onCallbackQuery(({ data }) => [
        data("next", ({ ctx }) =>
          ctx.editMessageText("Screen 2", {
            reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "back" }]] }
          })
        )
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, callbackQueryUpdate("next"))

    const calls = fetchCalls(fetchSpy)
    expect(calls.map(([url]) => methodOf(url))).toEqual(["answerCallbackQuery", "editMessageText"])

    const answer = decodeFormData(calls[0]![1])
    expect(answer?.callback_query_id).toBe("cb")

    const edit = decodeFormData(calls[1]![1])
    expect(edit?.chat_id).toBe("99")
    expect(edit?.message_id).toBe("1")
    expect(edit?.text).toBe("Screen 2")
    expect(JSON.parse(edit!.reply_markup!)).toEqual({
      inline_keyboard: [[{ text: "Back", callback_data: "back" }]]
    })
  })

  it("explicit answerCallbackQuery suppresses the automatic one and keeps order", async () => {
    const handler = createBot()
      .onCallbackQuery(({ data }) => [
        data("save", ({ ctx }) =>
          ctx.editMessageText("Saved").and(ctx.answerCallbackQuery({ text: "Done!" }))
        )
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, callbackQueryUpdate("save"))

    const calls = fetchCalls(fetchSpy)
    expect(calls.map(([url]) => methodOf(url))).toEqual(["editMessageText", "answerCallbackQuery"])
    expect(decodeFormData(calls[1]![1])?.text).toBe("Done!")
  })

  it("answerCallbackQuery alone (e.g. show_alert) sends exactly one call", async () => {
    const handler = createBot()
      .onCallbackQuery(({ data }) => [
        data("info", ({ ctx }) => ctx.answerCallbackQuery({ text: "Info", show_alert: true }))
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, callbackQueryUpdate("info"))

    const calls = fetchCalls(fetchSpy)
    expect(calls).toHaveLength(1)
    const body = decodeFormData(calls[0]![1])
    expect(body?.show_alert).toBe("true")
  })

  it("ctx.reply from a callback_query handler sends to the chat of the tapped message", async () => {
    const handler = createBot()
      .onCallbackQuery(({ data }) => [data("hello", ({ ctx }) => ctx.reply("Hi there"))])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, callbackQueryUpdate("hello"))

    const calls = fetchCalls(fetchSpy)
    expect(calls.map(([url]) => methodOf(url))).toEqual(["answerCallbackQuery", "sendMessage"])
    expect(decodeFormData(calls[1]![1])?.chat_id).toBe("99")
  })

  it("ignore does not answer the callback query", async () => {
    const handler = createBot()
      .onCallbackQuery(({ fallback }) => [fallback(({ ctx }) => ctx.ignore)])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, callbackQueryUpdate("x"))
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("deleteMessage and editMessageReplyMarkup target the tapped message", async () => {
    const handler = createBot()
      .onCallbackQuery(({ data }) => [
        data("close", ({ ctx }) => ctx.deleteMessage()),
        data("clear", ({ ctx }) => ctx.editMessageReplyMarkup())
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, callbackQueryUpdate("close"))
    await sendUpdate(handler, callbackQueryUpdate("clear"))

    const methods = fetchCalls(fetchSpy).map(([url]) => methodOf(url))
    expect(methods).toEqual([
      "answerCallbackQuery",
      "deleteMessage",
      "answerCallbackQuery",
      "editMessageReplyMarkup"
    ])
  })

  it("ctx.call sends an arbitrary API method", async () => {
    const handler = createBot()
      .onMessage(({ command }) => [
        command("/typing", ({ payload, ctx }) =>
          ctx.call("send_chat_action", { chat_id: payload.chat.id, action: "typing" })
        )
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, messageWithCommand("/typing"))
    expect(methodOf(lastUrl(fetchSpy)!)).toBe("sendChatAction")
  })

  it("BotResponse.all runs actions sequentially in order", async () => {
    const handler = createBot()
      .onMessage(({ command }) => [
        command("/two", ({ ctx }) => BotResponse.all(ctx.reply("one"), ctx.reply("two")))
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, messageWithCommand("/two"))

    const texts = fetchCalls(fetchSpy).map(([, init]) => decodeFormData(init)?.text)
    expect(texts).toEqual(["one", "two"])
  })

  it("answerCallbackQuery throws a descriptive error outside callback_query", async () => {
    const errors: string[] = []
    const handler = createBot()
      .onMessage(({ command }) => [command("/x", ({ ctx }) => ctx.answerCallbackQuery())])
      .webhook({
        bot_token: TOKEN,
        logger: silentLogger,
        onHandleResult: (r) => {
          if (r.error) errors.push(r.error)
        }
      })

    await sendUpdate(handler, messageWithCommand("/x"))
    expect(errors[0]).toMatch(/not a callback_query/)
  })
})

// ---------------------------------------------------------------------------
// Webhook secret token
// ---------------------------------------------------------------------------

describe("createBot — webhook secret_token", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(okResponse())
  })
  afterEach(() => fetchSpy.mockRestore())

  const withSecret = () =>
    createBot()
      .onMessage(({ command }) => [command("/start", ({ ctx }) => ctx.reply("hi"))])
      .webhook({ bot_token: TOKEN, secret_token: "s3cret", logger: silentLogger })

  const request = (secret?: string) =>
    new Request("https://example.test/webhook", {
      method: "POST",
      body: JSON.stringify(messageWithCommand("/start")),
      headers: {
        "content-type": "application/json",
        ...(secret !== undefined ? { "X-Telegram-Bot-Api-Secret-Token": secret } : {})
      }
    })

  it("rejects requests without the header", async () => {
    const res = await withSecret()(request())
    expect(res.status).toBe(403)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("rejects requests with a wrong secret", async () => {
    const res = await withSecret()(request("nope"))
    expect(res.status).toBe(403)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("accepts requests with the right secret", async () => {
    const res = await withSecret()(request("s3cret"))
    expect(res.status).toBe(200)
    expect(methodOf(lastUrl(fetchSpy)!)).toBe("sendMessage")
  })

  it("warns once when secret_token is omitted", () => {
    const warnings: string[] = []
    createBot()
      .onMessage(({ command }) => [command("/start", ({ ctx }) => ctx.reply("hi"))])
      .webhook({ bot_token: TOKEN, logger: { ...silentLogger, warn: (m) => warnings.push(m) } })
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toMatch(/secret_token/)
  })

  it("setWebhook forwards the configured secret_token", async () => {
    const handler = withSecret()
    await handler.setWebhook({ url: "https://example.test/webhook" })

    const [url, init] = fetchCalls(fetchSpy)[0]!
    expect(methodOf(url)).toBe("setWebhook")
    const body = decodeFormData(init)
    expect(body?.url).toBe("https://example.test/webhook")
    expect(body?.secret_token).toBe("s3cret")
  })
})

describe("createBot — shortcuts, array results, command matching", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(okResponse())
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  const methodsCalled = () => fetchCalls(fetchSpy).map((c) => String(c[0]).split("/").pop())

  it("bot.command / bot.onText / bot.onCallback register handlers", async () => {
    const seen: string[] = []
    const handler = createBot()
      .command("/start", ({ ctx }) => {
        seen.push("start")
        return ctx.reply("hi")
      })
      .onText(({ payload }) => {
        seen.push(`text:${payload.text}`)
        return BotResponse.ignore
      })
      .onCallback("go", ({ ctx }) => {
        seen.push("cb")
        return ctx.answerCallbackQuery({ text: "ok" })
      })
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, messageWithCommand("/start"))
    await sendUpdate(handler, messageUpdate({ text: "plain" }))
    await sendUpdate(handler, callbackQueryUpdate("go"))
    await sendUpdate(handler, callbackQueryUpdate("other"))

    expect(seen).toEqual(["start", "text:plain", "cb"])
  })

  it("accepts a single guard object in onMessage / on()", async () => {
    const seen: string[] = []
    const handler = createBot()
      .onMessage({
        match: ({ payload }) => payload.text === "yes",
        handle: () => {
          seen.push("yes")
          return BotResponse.ignore
        }
      })
      .on("my_chat_member", {
        handle: () => {
          seen.push("member")
          return BotResponse.ignore
        }
      })
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, messageUpdate({ text: "yes" }))
    await sendUpdate(handler, messageUpdate({ text: "no" }))
    await sendUpdate(handler, { update_id: 5, my_chat_member: { chat: { id: 1 } } } as Update)
    expect(seen).toEqual(["yes", "member"])
  })

  it("a handler may return an array of responses, executed in order", async () => {
    const handler = createBot()
      .onCallback("multi", ({ ctx }) => [
        ctx.answerCallbackQuery({ text: "done" }),
        ctx.editMessageText("edited"),
        ctx.reply("and a new message")
      ])
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, callbackQueryUpdate("multi"))
    expect(methodsCalled()).toEqual(["answerCallbackQuery", "editMessageText", "sendMessage"])
  })

  it("matches commands with a bot mention and in any case", async () => {
    const seen: string[] = []
    const handler = createBot()
      .command("start", () => {
        seen.push("start")
        return BotResponse.ignore
      })
      .command("/Help", ({ ctx }) => {
        seen.push(`help:${ctx.command}`)
        return BotResponse.ignore
      })
      .webhook({ bot_token: TOKEN, logger: silentLogger })

    await sendUpdate(handler, messageWithCommand("/start@my_test_bot"))
    await sendUpdate(handler, messageWithCommand("/START"))
    await sendUpdate(handler, messageWithCommand("/help@my_test_bot"))
    // A command that is not at the beginning of the text is not a command
    await sendUpdate(
      handler,
      messageUpdate({
        text: "see /start",
        entities: [{ type: "bot_command", offset: 4, length: 6 }]
      })
    )
    expect(seen).toEqual(["start", "start", "help:/help"])
  })
})
