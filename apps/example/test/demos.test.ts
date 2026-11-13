/**
 * Every demo bot, run against the in-memory emulator: the demo cannot break
 * silently when the SDK changes, and each test doubles as an example of
 * testing a bot without a token.
 */
import { makeTgBotEmulator } from "@effect-ak/tg-bot-emulator"
import type { Bot } from "@effect-ak/tg-bot"
import { readFileSync } from "node:fs"
import { deflateSync } from "node:zlib"
import { describe, expect, it } from "vitest"

import file from "../src/bots/file"
import {
  featuresBlocks,
  isHomeUpdate,
  makeHomeBot,
  snippetResults,
  SNIPPETS
} from "../src/bots/home"
import menu from "../src/bots/menu"
import { demos } from "../src/bots/registry"
import { applyBotProfile, BOT_PROFILE } from "../src/profile"
import { ANSWERS, answerFor, makeStreamBot } from "../src/bots/stream"
import tictactoe, { NEW_GAME, play, WIDGET_HTML } from "../src/bots/tictactoe"

const silentLogger = { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} }

/** Run `bot` against a fresh emulator for the duration of `use`. */
const withBot = async (
  bot: Bot,
  use: (emulator: ReturnType<typeof makeTgBotEmulator>) => Promise<void>
) => {
  const emulator = makeTgBotEmulator()
  const instance = await bot.run({ client: emulator.client, logger: silentLogger })
  try {
    await use(emulator)
  } finally {
    instance.stop()
  }
}

describe("registry", () => {
  it("every demo has a title, a description and a bot", () => {
    for (const demo of Object.values(demos)) {
      expect(demo.title).not.toBe("")
      expect(demo.description).not.toBe("")
      expect(typeof demo.bot.run).toBe("function")
    }
  })
})

describe("tic-tac-toe", () => {
  it("the widget fits Telegram's limits: 32 KB of HTML, 4 KB after zlib level 9", () => {
    expect(Buffer.byteLength(WIDGET_HTML)).toBeLessThanOrEqual(32768)
    expect(deflateSync(WIDGET_HTML, { level: 9 }).length).toBeLessThanOrEqual(4096)
  })

  it("plays a move and answers with the bot's move", () => {
    expect(play("n")).toBe(NEW_GAME)
    // You take the center, the bot takes a corner
    expect(play("m4---------")).toBe("o---x----p")
  })

  it("you can win, and so can the bot", () => {
    expect(play("m2xx-oo----")).toBe("xxxoo----x")
    // You ignore the bot's open column: it completes 1-4-7
    expect(play("m8xo-xo----")).toBe("xo-xo--oxo")
  })

  it("refuses illegal requests", () => {
    expect(play("m0x--------")).toBeUndefined() // occupied
    expect(play("m5xxxoo----")).toBeUndefined() // game over
    expect(play("m5xx-------")).toBeUndefined() // impossible board
    expect(play("hello")).toBeUndefined()
  })

  it("sends the widget and plays through it", () =>
    withBot(tictactoe, async (emulator) => {
      emulator.sendMessage("let's play")
      const message = await emulator.nextBotMessage()
      expect(message.widget?.chat_data).toBe(NEW_GAME)

      const saved = emulator.nextEvent((e) => e.type === "widget_data_changed")
      const outcome = await emulator.widgetRequest(message.message_id, "m4---------")
      expect(outcome).toEqual({ ok: true, result: "o---x----p" })
      await saved
      expect(emulator.messages.at(-1)?.widget?.chat_data).toBe("o---x----p")

      expect(await emulator.widgetRequest(message.message_id, "m4o---x----")).toEqual({
        ok: true,
        result: "invalid move"
      })
    }))
})

describe("streaming", () => {
  it("picks a fixed answer by keyword", () => {
    expect(answerFor("How do I TEST my bot?")).toBe(ANSWERS.find((a) => a.match.test("test"))?.text)
    expect(answerFor("hello")).toMatch(/Ask about one of them/)
  })

  it("streams drafts, then sends the whole answer", () =>
    withBot(makeStreamBot({ interval_ms: 0 }), async (emulator) => {
      let drafts = 0
      emulator.subscribe((e) => {
        if (e.type === "draft") drafts++
      })
      emulator.sendMessage("tell me about webhooks")
      const message = await emulator.nextBotMessage()
      expect(message.text).toBe(answerFor("webhooks"))
      expect(drafts).toBeGreaterThan(1)
    }))
})

describe("menu", () => {
  it("opens the main menu and navigates in place", () =>
    withBot(menu, async (emulator) => {
      emulator.sendMessage("/start")
      const root = await emulator.nextBotMessage()
      const services = root.reply_markup?.inline_keyboard
        .flat()
        .find((b) => b.text.includes("Services"))
      expect(services?.callback_data).toBeDefined()

      const edited = emulator.nextEvent((e) => e.type === "message_edited")
      emulator.tapButton(services!.callback_data!)
      await edited
      expect(emulator.messages.find((m) => m.message_id === root.message_id)?.text).toMatch(
        /Services/
      )
    }))
})

describe("file", () => {
  it("turns a text into a file with the same bytes", () =>
    withBot(file, async (emulator) => {
      emulator.sendMessage("hello file")
      const message = await emulator.nextBotMessage()
      const downloaded = await emulator.client.getFile({ fileId: message.document!.file_id })
      expect(new TextDecoder().decode(downloaded.content)).toBe("hello file")
    }))
})

describe("home", () => {
  const memory = new Map<number, string>()
  const home = makeHomeBot({
    get: async (chatId) => memory.get(chatId) ?? null,
    set: async (chatId, mode) => void memory.set(chatId, mode)
  })

  it("answers /features with a rich message", () =>
    withBot(home, async (emulator) => {
      emulator.sendMessage("/features")
      const message = await emulator.nextBotMessage()
      expect(message.rich_message?.blocks).toHaveLength(featuresBlocks.length)
    }))

  it("answers inline queries with matching snippets", () =>
    withBot(home, async (emulator) => {
      const answered = emulator.nextEvent((e) => e.type === "inline_results")
      emulator.sendInlineQuery("widget")
      await answered
      expect(emulator.inlineResults.map((r) => ("id" in r ? r.id : ""))).toEqual(["widget"])
    }))

  it("an empty query lists every snippet; inline updates always go to the home bot", () => {
    expect(snippetResults("")).toHaveLength(SNIPPETS.length)
    expect(
      isHomeUpdate({
        update_id: 1,
        inline_query: {
          id: "q",
          from: { id: 1, is_bot: false, first_name: "A" },
          query: "",
          offset: ""
        }
      })
    ).toBe(true)
  })
})

describe("bot profile", () => {
  it("fits Telegram's limits", () => {
    expect(BOT_PROFILE.short_description.length).toBeLessThanOrEqual(120)
    expect(BOT_PROFILE.description.length).toBeLessThanOrEqual(512)
  })

  it("is applied once, and a second deploy changes nothing", async () => {
    const emulator = makeTgBotEmulator()
    expect(await applyBotProfile(emulator.client)).toEqual([
      "description",
      "short description",
      "commands"
    ])
    expect(await emulator.client.execute("get_my_commands", {})).toEqual(BOT_PROFILE.commands)
    expect(await applyBotProfile(emulator.client)).toEqual([])
  })

  it("uploads the photo only while the bot has none", async () => {
    const emulator = makeTgBotEmulator()
    const photo = new Uint8Array(readFileSync(new URL("../assets/avatar.jpg", import.meta.url)))
    expect(await applyBotProfile(emulator.client, { photo })).toContain("photo")
    expect(await applyBotProfile(emulator.client, { photo })).toEqual([])

    const { photos } = await emulator.client.execute("get_user_profile_photos", {
      user_id: emulator.bot.id
    })
    const file = await emulator.client.getFile({ fileId: photos[0]![0]!.file_id })
    expect(file.content.byteLength).toBe(photo.byteLength)
  })
})
