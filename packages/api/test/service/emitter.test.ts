import { describe, expect, it } from "vitest"

import {
  assembleFile,
  emitExtractedType,
  emitInterface,
  emitNamespaceImport,
  emitTypeAlias
} from "~/service/emitter"
import { EntityFields, NormalType } from "~/scrape/type-system"
import { P, ref, union } from "~/scrape/type"
import type { ExtractedTypeShape } from "~/scrape/entity"

// ── Low-level emitters ──

describe("emitter primitives", () => {
  it("emits a namespace import", () => {
    expect(emitNamespaceImport("T", "./types")).toBe(
      `import * as T from "./types"`
    )
  })

  it("emits a type-only namespace import", () => {
    expect(emitNamespaceImport("T", "../event-handlers", true)).toBe(
      `import type * as T from "../event-handlers"`
    )
  })

  it("emits a type alias", () => {
    expect(emitTypeAlias("X", "A | B")).toBe("export type X = A | B")
  })

  it("emits an interface with properties and optional flag", () => {
    expect(
      emitInterface("User", [
        { name: "id", type: "number" },
        { name: "nickname", type: "string", optional: true }
      ])
    ).toBe(
      `export interface User {\n  id: number\n  nickname?: string\n}`
    )
  })

  it("emits an empty interface", () => {
    expect(emitInterface("Empty", [])).toBe("export interface Empty {}")
  })

  it("emits an interface with methods", () => {
    expect(
      emitInterface("Api", {
        methods: [
          {
            name: "get_me",
            parameters: [{ name: "_", type: "GetMeInput" }],
            returnType: "T.User"
          }
        ]
      })
    ).toBe(`export interface Api {\n  get_me(_: GetMeInput): T.User\n}`)
  })

  it("assembles a file with generated header and parts", () => {
    expect(assembleFile(["a", "b", undefined, "c"])).toBe(
      "// GENERATED CODE\n\na\n\nb\n\nc\n"
    )
  })

  it("assembles a file with only the header when all parts are empty", () => {
    expect(assembleFile([undefined, undefined])).toBe("// GENERATED CODE\n")
  })
})

// ── emitExtractedType dispatch ──

describe("emitExtractedType", () => {
  it("emits an interface for EntityFields", () => {
    const shape: ExtractedTypeShape = {
      typeName: "Foo",
      description: [],
      type: new EntityFields({
        fields: [
          {
            name: "a",
            type: NormalType.fromSpec(P.string),
            description: [],
            required: true
          },
          {
            name: "b",
            type: NormalType.fromSpec(P.integer),
            description: [],
            required: false
          }
        ]
      })
    }
    expect(emitExtractedType(shape)).toBe(
      `export interface Foo {\n  a: string\n  b?: number\n}`
    )
  })

  it("emits a type alias for NormalType union", () => {
    const shape: ExtractedTypeShape = {
      typeName: "Bar",
      description: [],
      type: NormalType.fromSpec(union(ref("A"), ref("B"), ref("C")))
    }
    expect(emitExtractedType(shape)).toBe(`export type Bar = A | B | C`)
  })

  it("prefixes complex type names with the provided namespace", () => {
    const shape: ExtractedTypeShape = {
      typeName: "Baz",
      description: [],
      type: NormalType.fromSpec(union(ref("User"), P.string))
    }
    expect(emitExtractedType(shape, { namespace: "T" })).toBe(
      `export type Baz = T.User | string`
    )
  })
})
