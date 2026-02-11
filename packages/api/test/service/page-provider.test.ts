import { describe, assert, expect } from "vitest"

import { extractBotApiEntities } from "~/scrape/entities"
import { fixture } from "~test/fixture/codegen-main"

describe("page provider service", () => {
  fixture("extract all", async ({ apiPage }) => {
    const all = extractBotApiEntities(apiPage)

    assert(all._tag == "Right")

    expect(all.right.methods.length).greaterThan(100)
  })
})
