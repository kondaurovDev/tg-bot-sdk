import type { Update } from "@effect-ak/tg-bot-api"
import type { TgBotClient } from "@effect-ak/tg-bot-client"
import { describe, expect, it, vi } from "vitest"

import { handleUpdates } from "~/bot-processor"
import { makePollSettings, type PollSettings } from "~/polling"
import type { BotBehavior } from "~/types"

const silentLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {}
}

const settings: PollSettings = makePollSettings({}, silentLogger)

const makeClient = (calls: Array<[string, any]>): TgBotClient => ({
  config: {} as never,
  execute: (() => Promise.reject(new Error("not used"))) as TgBotClient["execute"],
  executeSafe: (async (method: string, input: unknown) => {
    calls.push([method, input])
    return { ok: true, data: true }
  }) as TgBotClient["executeSafe"],
  getFile: (() => Promise.reject(new Error("not used"))) as TgBotClient["getFile"],
  getFileSafe: (() => Promise.reject(new Error("not used"))) as TgBotClient["getFileSafe"]
})

const textUpdate = (text: string): Update =>
  ({
    update_id: 1,
    message: { message_id: 1, date: 0, chat: { id: 42, type: "private" }, text }
  }) as Update

const runBehavior = async (behavior: BotBehavior, calls: Array<[string, any]>) =>
  handleUpdates([textUpdate("go")], behavior, makeClient(calls), settings, silentLogger)

describe("ctx.stream", () => {
  it("sends a thinking draft, per-chunk drafts, and a final message", async () => {
    const calls: Array<[string, any]> = []
    await runBehavior(
      {
        type: "single",
        on_message: {
          handle: ({ ctx }: any) => ctx.stream(["Hello ", "world"], { interval_ms: 0 })
        }
      } as unknown as BotBehavior,
      calls
    )

    expect(calls.map(([m]) => m)).toEqual([
      "send_message_draft", // thinking
      "send_message_draft", // "Hello "
      "send_message_draft", // "Hello world"
      "send_message"
    ])
    expect(calls[0][1]).toEqual({ chat_id: 42, draft_id: expect.any(Number) })
    expect(calls[2][1].text).toBe("Hello world")
    expect(calls[3][1]).toMatchObject({ chat_id: 42, text: "Hello world" })
  })

  it("splits a plain string into word chunks", async () => {
    const calls: Array<[string, any]> = []
    await runBehavior(
      {
        type: "single",
        on_message: { handle: ({ ctx }: any) => ctx.stream("one two three", { interval_ms: 0 }) }
      } as unknown as BotBehavior,
      calls
    )

    const drafts = calls.filter(([m, i]) => m === "send_message_draft" && i.text)
    expect(drafts.map(([, i]) => i.text)).toEqual(["one ", "one two ", "one two three"])
  })

  it("consumes an async generator and applies final options", async () => {
    async function* chunks() {
      yield "<b>bold"
      yield "</b> done"
    }
    const calls: Array<[string, any]> = []
    await runBehavior(
      {
        type: "single",
        on_message: {
          handle: ({ ctx }: any) =>
            ctx.stream(chunks(), {
              interval_ms: 0,
              parse_mode: "HTML",
              reply_markup: { inline_keyboard: [[{ text: "Again", callback_data: "again" }]] }
            })
        }
      } as unknown as BotBehavior,
      calls
    )

    const final = calls.at(-1)!
    expect(final[0]).toBe("send_message")
    expect(final[1]).toMatchObject({
      text: "<b>bold</b> done",
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "Again", callback_data: "again" }]] }
    })
  })

  it("a failing source still finalizes what was buffered", async () => {
    async function* chunks() {
      yield "partial "
      throw new Error("source died")
    }
    const warn = vi.fn()
    const calls: Array<[string, any]> = []
    await handleUpdates(
      [textUpdate("go")],
      {
        type: "single",
        on_message: { handle: ({ ctx }: any) => ctx.stream(chunks(), { interval_ms: 0 }) }
      } as unknown as BotBehavior,
      makeClient(calls),
      settings,
      { ...silentLogger, warn }
    )

    expect(calls.at(-1)![0]).toBe("send_message")
    expect(calls.at(-1)![1].text).toBe("partial ")
    expect(warn).toHaveBeenCalledWith("stream source failed", "source died")
  })
})
