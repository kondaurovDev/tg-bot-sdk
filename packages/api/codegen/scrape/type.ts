/**
 * @module type
 *
 * Language-agnostic structured representation of Telegram API types.
 *
 * Every type in the extracted spec — primitives, unions, arrays, enums,
 * inline objects — is a single {@link SpecType} tree. Renderers project
 * it to a concrete target:
 * - {@link renderTypeToTs} — TypeScript source (used by the codegen)
 * - JSON is direct serialisation of the tree itself (see `service/spec.ts`)
 *
 * Overrides build these trees via the small constructor helpers
 * (`primitive`, `ref`, `array`, `union`, `literal`, `object`, `raw`).
 */

// ── SpecType algebra ──

export type PrimitiveName =
  | "string"
  | "integer"
  | "float"
  | "boolean"
  | "bytes"

export interface ObjectField {
  name: string
  type: SpecType
  required: boolean
}

export type SpecType =
  | { kind: "primitive"; name: PrimitiveName }
  | { kind: "ref"; name: string }
  | { kind: "array"; element: SpecType }
  | {
      kind: "union"
      members: ReadonlyArray<SpecType>
      /** Field name that distinguishes the variants (e.g. `status` for
       * `ChatMember`). Set by spec post-processing when all members are refs
       * to interfaces sharing a single-value enum field. */
      discriminator?: string
    }
  | { kind: "enum"; values: ReadonlyArray<string> }
  | { kind: "object"; fields: ReadonlyArray<ObjectField> }
  /** Escape hatch: raw TS source that can't be structured (e.g. Mini Apps
   * function signatures). Non-TS consumers should treat it as opaque. */
  | { kind: "raw"; ts: string }

// ── Constructors ──

export const primitive = (name: PrimitiveName): SpecType => ({
  kind: "primitive",
  name
})
export const ref = (name: string): SpecType => ({ kind: "ref", name })
export const array = (element: SpecType): SpecType => ({
  kind: "array",
  element
})
export const union = (
  ...members: [SpecType, SpecType, ...SpecType[]]
): SpecType => ({ kind: "union", members })
export const enumOf = (
  ...values: [string, ...string[]]
): SpecType => ({ kind: "enum", values })
export const object = (fields: ObjectField[]): SpecType => ({
  kind: "object",
  fields
})
export const raw = (ts: string): SpecType => ({ kind: "raw", ts })

/** Convenience lookup for common primitives. */
export const P = {
  string: primitive("string"),
  integer: primitive("integer"),
  float: primitive("float"),
  boolean: primitive("boolean"),
  bytes: primitive("bytes")
} as const

// ── TS renderer ──

const needsParens = (t: SpecType): boolean =>
  t.kind === "union" || t.kind === "enum"

const primitiveToTs: Record<PrimitiveName, string> = {
  string: "string",
  integer: "number",
  float: "number",
  boolean: "boolean",
  bytes: "Uint8Array"
}

export const renderTypeToTs = (t: SpecType, namespace?: string): string => {
  switch (t.kind) {
    case "primitive":
      return primitiveToTs[t.name]
    case "ref":
      return namespace ? `${namespace}.${t.name}` : t.name
    case "array": {
      const inner = renderTypeToTs(t.element, namespace)
      return needsParens(t.element) ? `(${inner})[]` : `${inner}[]`
    }
    case "union":
      return t.members.map((m) => renderTypeToTs(m, namespace)).join(" | ")
    case "enum":
      return t.values.map((v) => `"${v}"`).join(" | ")
    case "object": {
      const body = t.fields
        .map(
          (f) =>
            `${f.name}${f.required ? "" : "?"}: ${renderTypeToTs(f.type, namespace)}`
        )
        .join(", ")
      return body.length === 0 ? "{}" : `{ ${body} }`
    }
    case "raw":
      return t.ts
  }
}

// ── Pseudo-type parsing (Telegram docs → SpecType) ──

const primitiveByPseudo: Record<string, PrimitiveName> = {
  String: "string",
  Integer: "integer",
  Int: "integer",
  Float: "float",
  Boolean: "boolean",
  True: "boolean",
  False: "boolean"
}

const ARRAY_PREFIX = /^array of /i

/**
 * Parse a Telegram pseudo-type string into a {@link SpecType}.
 * Handles unions via " or ", nested "Array of Array of ...", primitives, refs.
 */
export const parsePseudoType = (pseudo: string): SpecType | null => {
  const trimmed = pseudo.trim()
  if (trimmed.length === 0) return null

  if (trimmed.includes(" or ")) {
    const parts = trimmed
      .split(" or ")
      .map(parsePseudoType)
      .filter((t): t is SpecType => t !== null)
    if (parts.length < 2) return parts[0] ?? null
    return { kind: "union", members: parts }
  }

  if (ARRAY_PREFIX.test(trimmed)) {
    const inner = parsePseudoType(trimmed.replace(ARRAY_PREFIX, ""))
    if (!inner) return null
    return { kind: "array", element: inner }
  }

  const mapped = primitiveByPseudo[trimmed]
  if (mapped) return primitive(mapped)

  return ref(trimmed)
}
