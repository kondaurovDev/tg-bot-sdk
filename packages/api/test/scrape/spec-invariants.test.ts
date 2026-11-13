/**
 * Invariants of the generated spec, checked against the committed docs
 * snapshot. Each test guards a class of scraper mistakes rather than one
 * instance, so a new Bot API version that trips the same kind of mistake
 * fails here instead of shipping a wrong type. A failure message says how to
 * fix it; a deliberate exception goes into the allowlist next to the test,
 * with its reason.
 */
import { Either } from "effect"
import { readFileSync } from "node:fs"
import * as Path from "node:path"
import { assert, describe, expect } from "vitest"

import { fixture } from "~test/fixture/codegen-main"
import { webappFixture } from "~test/fixture/codegen-webapp"
import { extractBotApiEntities, ExtractedWebApp } from "~/scrape/entities"
import type { ExtractedTypeShape } from "~/scrape/entity"
import { removeHtmlTags } from "~/scrape/entity"
import { botApiFieldOverrides, miniAppFieldOverrides } from "~/scrape/overrides"
import { parseDocSignature } from "~/scrape/signature"
import { parsePseudoType, type SpecType } from "~/scrape/type"
import { inferFieldSpec, INITIALING_MINI_APPS, type EntityField } from "~/scrape/type-system"
import type { HtmlElement } from "~/types"

// ── Helpers ──

interface DocRow {
  /** Title of the H4 the table belongs to: `sendMessage`, `BackButton`, … */
  readonly entity: string
  readonly cells: readonly string[]
  /** Inner HTML of the last cell (the description). */
  readonly descriptionHtml: string
}

/**
 * Rows of the first table under every heading (nested tables excluded). Bot
 * API entities are H4s; the Mini Apps `WebApp` table sits under an H3.
 */
const docRows = (root: HtmlElement): DocRow[] => {
  const rows: DocRow[] = []
  for (const heading of root.querySelectorAll("h3, h4")) {
    let node = heading.nextElementSibling
    while (node && !["H3", "H4", "TABLE"].includes(node.tagName)) node = node.nextElementSibling
    if (node?.tagName !== "TABLE") continue
    const table = node
    for (const tr of table.querySelectorAll("tbody tr")) {
      if (tr.closest("table") !== table) continue
      const cells = tr.querySelectorAll("td").filter((td) => td.closest("table") === table)
      rows.push({
        entity: heading.text.trim(),
        cells: cells.map((td) => td.text.trim()),
        descriptionHtml: cells.at(-1)?.innerHTML ?? ""
      })
    }
  }
  return rows
}

const walk = (t: SpecType, visit: (t: SpecType) => void): void => {
  visit(t)
  if (t.kind === "array") walk(t.element, visit)
  if (t.kind === "union") t.members.forEach((m) => walk(m, visit))
  if (t.kind === "object") t.fields.forEach((f) => walk(f.type, visit))
}

interface NamedSpec {
  readonly where: string
  readonly spec: SpecType
}

const typeSpecs = (types: readonly ExtractedTypeShape[]): NamedSpec[] =>
  types.flatMap((t) =>
    t.type._tag === "EntityFields"
      ? t.type.fields.map((f) => ({ where: `${t.typeName}.${f.name}`, spec: f.type.spec }))
      : [{ where: t.typeName, spec: t.type.spec }]
  )

const fieldsOf = (types: readonly ExtractedTypeShape[]) =>
  new Map(
    types.flatMap((t): [string, readonly EntityField[]][] =>
      t.type._tag === "EntityFields" ? [[t.typeName, t.type.fields]] : []
    )
  )

const botApi = (apiPage: Parameters<typeof extractBotApiEntities>[0]) => {
  const entities = extractBotApiEntities(apiPage)
  assert(Either.isRight(entities), "Bot API extraction failed")
  return entities.right
}

const webApp = (webAppPage: Parameters<typeof ExtractedWebApp.make>[0]) => {
  const extracted = ExtractedWebApp.make(webAppPage)
  assert(Either.isRight(extracted), "Mini Apps extraction failed")
  return extracted.right
}

const isOpaque = (t: SpecType) => t.kind === "raw" && (t.ts === "never" || t.ts === "unknown")

// ── Bot API ──

describe("Bot API spec invariants", () => {
  fixture("no type is `never` or `unknown`", ({ apiPage }) => {
    const { types, methods } = botApi(apiPage)
    const all = [
      ...typeSpecs(types),
      ...methods.flatMap((m) => [
        { where: `${m.methodName} (return)`, spec: m.returnType.spec },
        ...(m.parameters?.fields ?? []).map((f) => ({
          where: `${m.methodName}.${f.name}`,
          spec: f.type.spec
        }))
      ])
    ]
    const opaque = all.filter(({ spec }) => {
      let found = false
      walk(spec, (t) => (found ||= isOpaque(t)))
      return found
    })
    // An object documented as "Currently holds no information" is `{}` on the
    // wire, not an impossible value. Fix in the scraper, not with an allowlist.
    expect(opaque.map((o) => o.where)).toEqual([])
  })

  fixture("every type cell in the docs parses into declared types", ({ apiPage }) => {
    const declared = new Set(botApi(apiPage).types.map((t) => t.typeName))
    const unresolved = docRows(apiPage.node)
      .filter((row) => /^\w+$/.test(row.entity) && row.cells.length >= 3)
      .flatMap((row) => {
        const parsed = parsePseudoType(row.cells[1] ?? "")
        const missing: string[] = []
        if (parsed)
          walk(parsed, (t) => t.kind === "ref" && !declared.has(t.name) && missing.push(t.name))
        return missing.map((name) => `${row.entity}.${row.cells[0]}: "${row.cells[1]}" → ${name}`)
      })
    // A cell the parser cannot split ends up as a reference to a type that does
    // not exist. Teach `parsePseudoType` the construct instead of overriding.
    expect(unresolved).toEqual([])
  })

  fixture("every field override is still needed", ({ apiPage }) => {
    const rows = docRows(apiPage.node)
    const stale = Object.entries(botApiFieldOverrides).flatMap(([entity, fields]) =>
      Object.entries(fields).flatMap(([field, override]) => {
        const row = rows.find((r) => r.entity === entity && r.cells[0] === field)
        if (!row) return [`${entity}.${field}: no longer in the docs`]
        const inferred = inferFieldSpec({
          entityName: entity,
          fieldName: field,
          pseudoType: row.cells[1] ?? "",
          description: [removeHtmlTags(row.descriptionHtml)]
        })
        return JSON.stringify(inferred) === JSON.stringify(override)
          ? [`${entity}.${field}: the scraper infers the same type — delete the override`]
          : []
      })
    )
    expect(stale).toEqual([])
  })

  fixture("every field documented as an attach:// upload accepts an InputFile", ({ apiPage }) => {
    const { types, methods } = botApi(apiPage)
    const fields = [
      ...[...fieldsOf(types)].flatMap(([owner, fs]) => fs.map((f) => ({ owner, f }))),
      ...methods.flatMap((m) =>
        (m.parameters?.fields ?? []).map((f) => ({ owner: m.methodName, f }))
      )
    ]
    const rejecting = fields
      .filter(({ f }) => f.description.some((line) => line.includes("attach://")))
      .filter(({ f }) => {
        let accepts = false
        walk(f.type.spec, (t) => (accepts ||= t.kind === "ref" && t.name === "InputFile"))
        return !accepts
      })
      .map(({ owner, f }) => `${owner}.${f.name}`)
    // Such a field takes a file uploaded as its own multipart part; without
    // InputFile in its type, users cannot pass one. See globalFieldOverrides.
    expect(rejecting).toEqual([])
  })

  /**
   * String fields whose description lists values in quotes but that are
   * deliberately left a plain string, with the reason.
   */
  const notAnEnum: Record<string, string> = {
    "EncryptedPassportElement.data":
      "the quoted values name the element types the field is available for, not its values"
  }

  fixture("a String field whose description lists its values is an enum", ({ apiPage }) => {
    const { types, methods } = botApi(apiPage)
    const fields = [
      ...[...fieldsOf(types)].flatMap(([owner, fs]) => fs.map((f) => ({ owner, f }))),
      ...methods.flatMap((m) =>
        (m.parameters?.fields ?? []).map((f) => ({ owner: m.methodName, f }))
      )
    ]
    const missed = fields
      .filter(({ f }) => f.type.spec.kind === "primitive" && f.type.spec.name === "string")
      .filter(({ f }) => {
        const text = f.description.join(" ")
        const quoted = text.match(/[“"][^”"]+[”"]/g) ?? []
        return quoted.length >= 2 && /\b(must be|always|one of|can be|either)\b/i.test(text)
      })
      .map(({ owner, f }) => `${owner}.${f.name}`)
      .filter((where) => !(where in notAnEnum))
    // Widen the enum extraction in `type-system.ts`, add a field override, or
    // allowlist the field above with a reason.
    expect(missed).toEqual([])
  })
})

// ── Mini Apps ──

/** Bracket depth change of `ts[i]`; the `>` of an arrow `=>` is not a bracket. */
const depthStep = (ts: string, i: number): number => {
  const ch = ts[i] ?? ""
  if ("([{<".includes(ch)) return 1
  if (")]}".includes(ch) || (ch === ">" && ts[i - 1] !== "=")) return -1
  return 0
}

/** Parameters of the outer arrow of a raw TS signature; `undefined` if it is not an arrow. */
const tsParams = (ts: string) => {
  if (!ts.startsWith("(")) return undefined
  let depth = 0
  let end = -1
  for (let i = 0; i < ts.length && end < 0; i++) {
    depth += depthStep(ts, i)
    if (depth === 0) end = i
  }
  const params: { name: string; optional: boolean }[] = []
  let current = ""
  depth = 0
  const inner = ts.slice(1, end) + ","
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i]
    depth += depthStep(inner, i)
    if (ch === "," && depth === 0) {
      const head = current.trim().split(":")[0]?.trim() ?? ""
      if (head) params.push({ name: head.replace(/\?$/, ""), optional: head.endsWith("?") })
      current = ""
    } else current += ch
  }
  return params
}

describe("Mini Apps spec invariants", () => {
  webappFixture("no field is `never` or `unknown`", ({ webAppPage }) => {
    const { fields, types } = webApp(webAppPage)
    const all = [
      ...fields.map((f) => ({ where: `WebApp.${f.name}`, spec: f.type.spec })),
      ...typeSpecs(types)
    ]
    expect(all.filter(({ spec }) => isOpaque(spec)).map((o) => o.where)).toEqual([])
  })

  webappFixture("method signatures match the docs", ({ webAppPage }) => {
    const { fields, types } = webApp(webAppPage)
    const generated = new Map(fieldsOf(types))
    generated.set(INITIALING_MINI_APPS, fields)

    /** Deliberate departures from the docs' signature, with the reason. */
    const exceptions: Record<string, string> = {
      "BottomButton.showProgress":
        "documented as showProgress(leaveActive), but the flag is optional: showProgress() is the common call"
    }

    const problems = docRows(webAppPage.node)
      .filter((row) => row.cells[1] === "Function")
      .flatMap((row) => {
        const doc = parseDocSignature(row.cells[0] ?? "")
        if (!doc) return []
        const where = `${row.entity === INITIALING_MINI_APPS ? "WebApp" : row.entity}.${doc.name}`
        if (where in exceptions) return []
        const field = generated.get(row.entity)?.find((f) => f.name === doc.name)
        if (!field) return [`${where}: documented but not generated`]
        const override = miniAppFieldOverrides[row.entity]?.[doc.name]
        if (doc.params.length > 0 && !override) {
          return [`${where}: has parameters but no override with their types — add one`]
        }
        const spec = field.type.spec
        const params = spec.kind === "raw" ? tsParams(spec.ts) : undefined
        if (!params) return [] // an alias such as `T.BindOrUnbindEventHandler`
        const expected = doc.params.map((p) => `${p.name}${p.optional ? "?" : ""}`).join(", ")
        const actual = params.map((p) => `${p.name}${p.optional ? "?" : ""}`).join(", ")
        return expected === actual ? [] : [`${where}: docs (${expected}), override (${actual})`]
      })
    expect(problems).toEqual([])
  })

  webappFixture("EventHandlers covers every documented event", ({ webAppPage }) => {
    const documented = docRows(webAppPage.node)
      .filter((row) => row.entity === "Events Available for Mini Apps")
      .map((row) => row.cells[0] ?? "")
    expect(documented.length).toBeGreaterThan(0)

    const source = readFileSync(
      Path.resolve(import.meta.dirname, "..", "..", "src", "event-handlers.ts"),
      "utf-8"
    )
    const body = /export interface EventHandlers \{([\s\S]*?)\n\}/.exec(source)?.[1] ?? ""
    const handled = new Set([...body.matchAll(/^ {2}(\w+):/gm)].map((m) => m[1]))
    // Add the event and its payload to `src/event-handlers.ts`.
    expect(documented.filter((e) => !handled.has(e))).toEqual([])
  })
})
