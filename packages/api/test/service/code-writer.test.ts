import { describe, assert } from "vitest"
import { Effect } from "effect"

import { fixture } from "~test/fixture/codegen-main"

describe("code writer service", () => {
  fixture("create file and write one line", async ({ tsMorph, skip }) => {
    skip()

    const src = tsMorph.createTsFile("test2")

    assert(src._tag == "Right")

    src.right.addStatements((writer) => writer.writeLine("//** fist line"))

    const saved = await tsMorph.saveFiles.pipe(Effect.runPromiseExit)

    assert(saved._tag == "Success")
  })
})
