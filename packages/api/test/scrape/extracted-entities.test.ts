import { describe, expect } from "vitest"

import { fixture } from "~test/fixture/codegen-main"
import { expectRight } from "~test/fixture/either"
import { extractBotApiEntities } from "~/scrape/entities"

describe("extracted entities", () => {
  fixture("scrape produces all core methods and types", ({ apiPage }) => {
    const ns = expectRight(extractBotApiEntities(apiPage), "extractBotApiEntities")

    // Invariant: these methods/types have been part of the Bot API for years.
    // Stronger than `length > 70` — it actually verifies scrape is producing
    // the right shapes and not just *some* shapes.
    const methodNames = new Set(ns.methods.map((_) => _.methodName))
    const typeNames = new Set(ns.types.map((_) => _.typeName))

    for (const name of [
      "getMe",
      "getUpdates",
      "sendMessage",
      "sendDocument",
      "sendPhoto",
      "answerCallbackQuery",
      "setWebhook",
      "deleteWebhook"
    ]) {
      expect(methodNames, `method ${name}`).toContain(name)
    }

    for (const name of [
      "Update",
      "Message",
      "Chat",
      "User",
      "InlineKeyboardMarkup",
      "ReplyKeyboardMarkup",
      "CallbackQuery",
      "InputFile"
    ]) {
      expect(typeNames, `type ${name}`).toContain(name)
    }

    // Sanity floor — guards against the scrape collapsing entirely.
    expect(ns.methods.length).toBeGreaterThan(70)
    expect(ns.types.length).toBeGreaterThan(100)
  })
})
