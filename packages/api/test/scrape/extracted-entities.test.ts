import { describe, expect, assert } from "vitest"

import { fixture } from "~test/fixture/codegen-main"
import { extractBotApiEntities } from "~/scrape/entities"

describe("extracted entities", () => {
  fixture("extract", async ({ apiPage }) => {
    const ns = extractBotApiEntities(apiPage)

    if (ns._tag == "Left") {
      console.log(ns.left)
    }

    assert(ns._tag == "Right")

    expect(ns.right.methods.length).toBeGreaterThan(70)
    expect(ns.right.types.length).toBeGreaterThan(100)
  })
})
