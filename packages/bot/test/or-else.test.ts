import type { Update } from "@effect-ak/tg-bot-api"
import type { TgBotClient } from "@effect-ak/tg-bot-client"
import { describe, expect, it } from "vitest"

import { handleUpdates } from "~/bot-processor"
import { makePollSettings, type PollSettings } from "~/polling"
import { BotResponse, type BotBehavior } from "~/types"

const silentLogger = { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} }
const settings: PollSettings = makePollSettings({}, silentLogger)

/** A client that refuses the listed methods with a 400, and records every call. */
const makeClient = (calls: Array<[string, any]>, refuse: string[] = []): TgBotClient => ({
  config: {} as never,
  execute: (() => Promise.reject(new Error("not used"))) as TgBotClient["execute"],
  executeSafe: (async (method: string, input: unknown) => {
    calls.push([method, input])
    return refuse.includes(method)
      ? {
          ok: false,
          error: { _tag: "NotOkResponse", errorCode: 400, details: "Bad Request: NOT_ALLOWED" }
        }
      : { ok: true, data: true }
  }) as TgBotClient["executeSafe"],
  getFile: (() => Promise.reject(new Error("not used"))) as TgBotClient["getFile"],
  getFileSafe: (() => Promise.reject(new Error("not used"))) as TgBotClient["getFileSafe"]
})

const textUpdate = {
  update_id: 1,
  message: { message_id: 1, date: 0, chat: { id: 42, type: "private" }, text: "go" }
} as Update
const callbackUpdate = {
  update_id: 2,
  callback_query: {
    id: "q1",
    from: { id: 7, is_bot: false, first_name: "U" },
    chat_instance: "1",
    data: "go",
    message: { message_id: 5, date: 0, chat: { id: 42, type: "private" } }
  }
} as Update

const run = (
  handle: (args: any) => BotResponse,
  calls: Array<[string, any]>,
  refuse: string[] = [],
  update = textUpdate
) =>
  handleUpdates(
    [update],
    {
      type: "single",
      [update === textUpdate ? "on_message" : "on_callback_query"]: { handle }
    } as unknown as BotBehavior,
    makeClient(calls, refuse),
    settings,
    silentLogger
  )

describe("BotResponse.orElse", () => {
  it("runs the fallback with the error when a call is refused, and skips the rest", async () => {
    const calls: Array<[string, any]> = []
    let seen: unknown
    await run(
      ({ ctx }) =>
        ctx
          .call("send_widget", { chat_id: 42, html: "<p>hi</p>" })
          .and(ctx.reply("after the widget"))
          .orElse((error: unknown) => {
            seen = error
            return ctx.reply("no widget")
          }),
      calls,
      ["send_widget"]
    )

    expect(calls.map(([m, p]) => [m, p.text])).toEqual([
      ["send_widget", undefined],
      ["send_message", "no widget"]
    ])
    expect(seen).toEqual({
      _tag: "NotOkResponse",
      errorCode: 400,
      details: "Bad Request: NOT_ALLOWED"
    })
  })

  it("does nothing more when every call succeeds", async () => {
    const calls: Array<[string, any]> = []
    await run(
      ({ ctx }) => ctx.reply("one").and(ctx.reply("two")).orElse(ctx.reply("fallback")),
      calls
    )
    expect(calls.map(([, p]) => p.text)).toEqual(["one", "two"])
  })

  it("lets what follows run once the fallback has handled the failure", async () => {
    const calls: Array<[string, any]> = []
    await run(
      ({ ctx }) =>
        BotResponse.all(
          ctx.call("send_widget", { chat_id: 42, html: "x" }).orElse(ctx.reply("fallback")),
          ctx.reply("next")
        ),
      calls,
      ["send_widget"]
    )
    expect(calls.map(([m, p]) => p.text ?? m)).toEqual(["send_widget", "fallback", "next"])
  })

  it("sees an answer inside orElse, so a callback query is not answered twice", async () => {
    const calls: Array<[string, any]> = []
    await run(
      ({ ctx }) => ctx.answerCallbackQuery({ text: "ok" }).orElse(ctx.reply("failed")),
      calls,
      [],
      callbackUpdate
    )
    expect(calls.map(([m]) => m)).toEqual(["answer_callback_query"])
  })

  it("an empty response stays empty", () => {
    expect(BotResponse.ignore.orElse(BotResponse.ignore).isEmpty).toBe(true)
  })
})
