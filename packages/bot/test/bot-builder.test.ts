import type { Message, Update } from "@effect-ak/tg-bot-api"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createBot } from "~/bot-builder"
import { BotResponse } from "~/types"

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
          match: ({ update }) => {
            calls.push("first.match")
            return !!update.text
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
        query(/^foo/, ({ update }) => {
          seen.push(`foo:${update.query}`)
          return BotResponse.ignore
        }),
        fallback(({ update }) => {
          seen.push(`fallback:${update.query}`)
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
