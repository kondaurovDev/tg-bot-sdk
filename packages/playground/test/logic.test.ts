import { describe, expect, it } from "vitest"

import { initialLogs, logsReducer, type LogsState } from "../src/logs"
import type { WorkerEvent } from "../src/protocol"
import { rewriteSdkImports } from "../src/sdk-imports"

const SDK = new Set(["@effect-ak/tg-bot", "@effect-ak/tg-bot-api"])

describe("rewriteSdkImports", () => {
  it("reads named, namespace and default imports from the bundled SDK", () => {
    const code = [
      `import { createBot, defineScreens as screens } from "@effect-ak/tg-bot";`,
      `import * as api from "@effect-ak/tg-bot-api"`,
      `import bot from "@effect-ak/tg-bot"`
    ].join("\n")

    expect(rewriteSdkImports(code, SDK).split("\n")).toEqual([
      `const { createBot, defineScreens: screens } = globalThis.__TG_BOT_SDK__["@effect-ak/tg-bot"];`,
      `const api = globalThis.__TG_BOT_SDK__["@effect-ak/tg-bot-api"];`,
      `const bot = globalThis.__TG_BOT_SDK__["@effect-ak/tg-bot"].default ?? globalThis.__TG_BOT_SDK__["@effect-ak/tg-bot"];`
    ])
  })

  it("leaves other imports alone", () => {
    const code = `import { z } from "zod"`
    expect(rewriteSdkImports(code, SDK)).toBe(code)
  })
})

describe("logsReducer", () => {
  const apply = (events: WorkerEvent[], state: LogsState = initialLogs) =>
    events.reduce((s, event) => logsReducer(s, { type: "event", event }), state)

  it("counts handle results and failed actions per run", () => {
    const state = apply([
      {
        type: "handle-result",
        updateType: "message",
        status: "handled",
        responseType: "message",
        duration: 2
      },
      { type: "handle-result", updateType: "message", status: "no_handler", duration: 1 },
      { type: "action-error", error: "no such button" }
    ])

    expect(state.stats).toEqual({ handled: 1, ignored: 0, noHandler: 1, errors: 1 })
    expect(state.entries.map((e) => e.text)).toEqual([
      "on_message → handled → message 2ms",
      "on_message → no handler",
      "no such button"
    ])
    expect(logsReducer(state, { type: "new-run" }).stats.handled).toBe(0)
  })

  it("summarizes updates", () => {
    const state = apply([
      {
        type: "update",
        update: {
          update_id: 1,
          message: {
            message_id: 1,
            date: 0,
            chat: { id: 1, type: "private" },
            from: { id: 1, is_bot: false, first_name: "You" },
            text: "/start"
          }
        }
      }
    ])
    expect(state.entries[0]).toMatchObject({ kind: "update", text: "@You: /start" })
  })
})

describe("share links", () => {
  it("round-trips code through the link", async () => {
    const { decodeCode, encodeCode } = await import("../src/share")
    const code = `import { createBot } from "@effect-ak/tg-bot"\n// ✓ unicode — dashes\n`.repeat(20)
    const encoded = await encodeCode(code)
    expect(encoded).toMatch(/^[\w-]+$/)
    expect(encoded.length).toBeLessThan(code.length)
    expect(await decodeCode(encoded)).toBe(code)
    expect(await decodeCode("not-a-link")).toBeNull()
  })

  it("reads ?example= and #code=, and builds links back", async () => {
    const { readShareLink, shareLink } = await import("../src/share")
    expect(readShareLink(new URL("https://x.dev/playground/?example=rich#code=abc"))).toEqual({
      example: "rich.ts",
      code: "abc"
    })
    expect(readShareLink(new URL("https://x.dev/playground/"))).toEqual({})
    const base = new URL("https://x.dev/playground/?example=old#code=zzz")
    expect(shareLink(base, "dice.ts", null)).toBe("https://x.dev/playground/?example=dice")
    expect(shareLink(base, "dice.ts", "q1")).toBe("https://x.dev/playground/?example=dice#code=q1")
  })
})
