import { Either } from "effect"
import { describe, expect, it, assert } from "vitest"

import { ExtractedEntity } from "~/scrape/entity"
import { parseStringToHtml } from "~/types"

/**
 * Parse a minimal HTML document and return the single H4 node so it can be
 * fed into {@link ExtractedEntity.makeFrom}. Mirrors the shape `DocPage.getEntity`
 * produces when following the `a.anchor` → parent path.
 */
const makeEntityNode = (html: string) => {
  const parsed = parseStringToHtml(html)
  assert(Either.isRight(parsed), "html parsing failed")
  const h4 = parsed.right.querySelector("h4")
  assert(h4 !== null, "h4 not found in fixture")
  return h4
}

describe("regression: extractFromTable", () => {
  it("does not crash when a 3-column table row has an empty description", () => {
    const h4 = makeEntityNode(`
      <h4><a class="anchor" name="testtype"></a>TestType</h4>
      <p>A test type description.</p>
      <table class="table">
        <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>field1</td><td>String</td><td></td></tr>
          <tr><td>field2</td><td>Integer</td><td>Optional. A number.</td></tr>
        </tbody>
      </table>
    `)

    const entity = ExtractedEntity.makeFrom(h4)
    assert(Either.isRight(entity), "entity extraction failed")
    assert(entity.right.type._tag == "EntityFields")

    const fields = entity.right.type.fields

    const field1 = fields.find((_) => _.name == "field1")
    expect(field1?.required).toBe(true)
    expect(field1?.description).toEqual([])

    const field2 = fields.find((_) => _.name == "field2")
    expect(field2?.required).toBe(false)
    expect(field2?.description).toEqual(["A number."])
  })

  it("preserves field name when Function pseudo-type lacks parentheses", () => {
    const h4 = makeEntityNode(`
      <h4><a class="anchor" name="weirdapi"></a>WeirdApi</h4>
      <p>Simulates a malformed Function row in Telegram docs.</p>
      <table class="table">
        <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>noParens</td><td>Function</td><td>Malformed row without parens.</td></tr>
          <tr><td>withParens()</td><td>Function</td><td>Normal callable row.</td></tr>
        </tbody>
      </table>
    `)

    const entity = ExtractedEntity.makeFrom(h4)
    assert(Either.isRight(entity), "entity extraction failed")
    assert(entity.right.type._tag == "EntityFields")

    const names = entity.right.type.fields.map((_) => _.name)
    // Before the fix, "noParens" was truncated to "noParen" because
    // substring(0, indexOf("(") /* = -1 */) dropped the last character.
    expect(names).toContain("noParens")
    expect(names).toContain("withParens")
  })
})
