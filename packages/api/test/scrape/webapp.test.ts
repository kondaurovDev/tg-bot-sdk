import { assert, describe, expect } from "vitest"
import { webappFixture } from "~test/fixture/codegen-webapp"
import { ExtractedWebApp } from "~/scrape/entities"

describe("webapp", () => {
  webappFixture("parse main app object", ({ webAppPage }) => {
    const a = ExtractedWebApp.make(webAppPage)

    assert(a._tag == "Right")
    expect(a.right.types.length).toBeGreaterThan(0)
    expect(a.right.fields.length).toBeGreaterThan(0)

    const typeNames = a.right.types.map(t => t.typeName)
    expect(typeNames).toContain("ThemeParams")
    expect(typeNames).toContain("SafeAreaInset")
    expect(typeNames).toContain("WebAppInitData")

    const h4nodes = webAppPage.node.querySelectorAll("h4")
    expect(h4nodes.length).toBeGreaterThan(0)
    expect(h4nodes.some(n => n.text?.includes("ThemeParams"))).toBe(true)
  })
})
