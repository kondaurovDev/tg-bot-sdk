/**
 * @module spec
 *
 * Builds a language-agnostic JSON snapshot of the scraped Telegram Bot API
 * and Mini Apps spec. Consumers (TS SDK, playground, third-party code
 * generators for other languages) can read this file instead of re-parsing
 * the official HTML docs.
 *
 * Design notes:
 * - Each type/parameter carries a structured {@link SpecType} tree (primitive,
 *   ref, array, union, enum, object, raw). No TS strings leak into JSON.
 * - Top-level declarations are discriminated by presence of `fields` (object)
 *   vs `type` (type alias). No `kind` tag needed at the declaration level.
 * - Unions whose variants share a single-value enum field get an auto-detected
 *   `discriminator` (e.g. `ChatMember` → `status`).
 * - `kind: "raw"` wraps TS source the scraper can't structure (Mini Apps
 *   function signatures). Non-TS consumers should treat it as opaque.
 */
import { writeFile, mkdir } from "node:fs/promises"
import * as Path from "node:path"

import type {
  ExtractedMethodShape,
  ExtractedType,
  ExtractedTypeShape
} from "~/scrape/entity"
import type { ExtractedEntitiesShape } from "~/scrape/entities"
import { ExtractedWebApp } from "~/scrape/entities"
import type { EntityField } from "~/scrape/type-system"
import type { SpecType as StructuredType } from "~/scrape/type"

// ── Shapes ──

const SPEC_VERSION = "1.0.0"

export interface SpecField {
  name: string
  type: StructuredType
  required: boolean
  description: string[]
}

export interface SpecInterface {
  name: string
  description: string[]
  fields: SpecField[]
}

export interface SpecAlias {
  name: string
  description: string[]
  type: StructuredType
}

export type SpecDecl = SpecInterface | SpecAlias

export interface SpecMethod {
  name: string
  group?: string
  description: string[]
  return: StructuredType
  parameters: SpecField[]
}

export interface BotApiSpec {
  spec_version: string
  version: string
  generated_at: string
  methods: SpecMethod[]
  types: SpecDecl[]
}

export interface MiniAppSpec {
  spec_version: string
  version: string
  generated_at: string
  webapp: {
    fields: SpecField[]
  }
  types: SpecDecl[]
}

// ── Conversion ──

const toSpecField = (f: EntityField): SpecField => ({
  name: f.name,
  required: f.required,
  description: f.description,
  type: f.type.toSpec()
})

const toSpecDecl = (t: ExtractedType | ExtractedTypeShape): SpecDecl => {
  if (t.type._tag === "EntityFields") {
    return {
      name: t.typeName,
      description: t.description,
      fields: t.type.fields.map(toSpecField)
    }
  }
  return {
    name: t.typeName,
    description: t.description,
    type: t.type.toSpec()
  }
}

const toSpecMethod = (m: ExtractedMethodShape): SpecMethod => ({
  name: m.methodName,
  ...(m.groupName ? { group: m.groupName } : undefined),
  description: m.methodDescription,
  return: m.returnType.toSpec(),
  parameters: m.parameters?.fields.map(toSpecField) ?? []
})

// ── Discriminator detection ──

const isInterface = (d: SpecDecl): d is SpecInterface => "fields" in d

/** Build a name → SpecInterface lookup for discriminator detection. */
const buildInterfaceIndex = (
  types: SpecDecl[]
): Map<string, SpecInterface> => {
  const map = new Map<string, SpecInterface>()
  for (const t of types) {
    if (isInterface(t)) map.set(t.name, t)
  }
  return map
}

/**
 * Detect the discriminator field for a union of refs.
 *
 * Returns the field name iff every variant:
 *  - resolves to an interface in `index`
 *  - has a field with that name whose type is a single-value enum
 *  - and the values are unique across all variants.
 */
const detectDiscriminator = (
  members: ReadonlyArray<StructuredType>,
  index: Map<string, SpecInterface>
): string | null => {
  if (!members.every((m) => m.kind === "ref")) return null

  const interfaces: SpecInterface[] = []
  for (const m of members) {
    const iface = index.get((m as { name: string }).name)
    if (!iface) return null
    interfaces.push(iface)
  }

  for (const candidate of interfaces[0].fields) {
    const values: string[] = []
    let valid = true
    for (const iface of interfaces) {
      const f = iface.fields.find((x) => x.name === candidate.name)
      if (!f || f.type.kind !== "enum" || f.type.values.length !== 1) {
        valid = false
        break
      }
      values.push(f.type.values[0]!)
    }
    if (!valid) continue
    if (new Set(values).size !== values.length) continue
    return candidate.name
  }
  return null
}

/** Recursively annotate every union-of-refs with its discriminator. */
const annotateDiscriminators = (
  t: StructuredType,
  index: Map<string, SpecInterface>
): StructuredType => {
  switch (t.kind) {
    case "union": {
      const members = t.members.map((m) => annotateDiscriminators(m, index))
      const disc = detectDiscriminator(members, index)
      return disc
        ? { kind: "union", members, discriminator: disc }
        : { kind: "union", members }
    }
    case "array":
      return { kind: "array", element: annotateDiscriminators(t.element, index) }
    case "object":
      return {
        kind: "object",
        fields: t.fields.map((f) => ({
          ...f,
          type: annotateDiscriminators(f.type, index)
        }))
      }
    default:
      return t
  }
}

const annotateDecl = (
  d: SpecDecl,
  index: Map<string, SpecInterface>
): SpecDecl =>
  isInterface(d)
    ? {
        ...d,
        fields: d.fields.map((f) => ({
          ...f,
          type: annotateDiscriminators(f.type, index)
        }))
      }
    : { ...d, type: annotateDiscriminators(d.type, index) }

const annotateMethod = (
  m: SpecMethod,
  index: Map<string, SpecInterface>
): SpecMethod => ({
  ...m,
  return: annotateDiscriminators(m.return, index),
  parameters: m.parameters.map((p) => ({
    ...p,
    type: annotateDiscriminators(p.type, index)
  }))
})

const annotateField = (
  f: SpecField,
  index: Map<string, SpecInterface>
): SpecField => ({ ...f, type: annotateDiscriminators(f.type, index) })

// ── Builders ──

export const buildBotApiSpec = (
  entities: ExtractedEntitiesShape,
  version: string
): BotApiSpec => {
  const rawTypes = entities.types.map(toSpecDecl)
  const rawMethods = entities.methods.map(toSpecMethod)
  const index = buildInterfaceIndex(rawTypes)
  return {
    spec_version: SPEC_VERSION,
    version,
    generated_at: new Date().toISOString(),
    methods: rawMethods.map((m) => annotateMethod(m, index)),
    types: rawTypes.map((d) => annotateDecl(d, index))
  }
}

export const buildMiniAppSpec = (
  extracted: ExtractedWebApp,
  version: string
): MiniAppSpec => {
  const rawTypes = extracted.types.map(toSpecDecl)
  const rawFields = extracted.fields.map(toSpecField)
  const index = buildInterfaceIndex(rawTypes)
  return {
    spec_version: SPEC_VERSION,
    version,
    generated_at: new Date().toISOString(),
    webapp: {
      fields: rawFields.map((f) => annotateField(f, index))
    },
    types: rawTypes.map((d) => annotateDecl(d, index))
  }
}

// ── Writer ──

export const writeSpecJson = async (
  outPath: string,
  spec: BotApiSpec | MiniAppSpec
) => {
  await mkdir(Path.dirname(outPath), { recursive: true })
  await writeFile(outPath, JSON.stringify(spec, null, 2) + "\n")
  console.log("Wrote", outPath)
}
