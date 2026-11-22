/**
 * @module spec
 * The machine-readable Bot API spec (`bot-api.json`), read the way any
 * third-party consumer reads it: the shapes below restate its `1.0.0` format
 * instead of importing the codegen's own types.
 */
import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

export type SpecType =
  | { kind: "primitive"; name: "string" | "integer" | "float" | "boolean" | "bytes" }
  | { kind: "ref"; name: string }
  | { kind: "array"; element: SpecType }
  | { kind: "union"; members: readonly SpecType[]; discriminator?: string }
  | { kind: "enum"; values: readonly string[] }
  | { kind: "object"; fields: readonly SpecField[] }
  | { kind: "raw"; ts: string }

export interface SpecField {
  name: string
  type: SpecType
  required: boolean
}

export interface SpecInterface {
  name: string
  fields: readonly SpecField[]
}

export interface SpecAlias {
  name: string
  type: SpecType
}

export type SpecDecl = SpecInterface | SpecAlias

export interface SpecMethod {
  name: string
  return: SpecType
  parameters: readonly SpecField[]
}

export interface BotApiSpec {
  version: string
  methods: readonly SpecMethod[]
  types: readonly SpecDecl[]
}

export const isInterface = (decl: SpecDecl): decl is SpecInterface => "fields" in decl

/** Where codegen writes the spec (`pnpm --filter @effect-ak/tg-bot-api gen`). */
const specPath = fileURLToPath(
  new URL("../../../apps/website/public/bot-api.json", import.meta.url)
)

/** The top level of the format; the declarations inside are taken on trust. */
const isBotApiSpec = (value: unknown): value is BotApiSpec =>
  typeof value === "object" &&
  value !== null &&
  "version" in value &&
  typeof value.version === "string" &&
  "methods" in value &&
  Array.isArray(value.methods) &&
  "types" in value &&
  Array.isArray(value.types)

export const loadBotApiSpec = (): BotApiSpec => {
  if (!existsSync(specPath)) {
    throw new Error(
      `${specPath} is missing: generate it with "pnpm --filter @effect-ak/tg-bot-api gen"`
    )
  }
  const spec: unknown = JSON.parse(readFileSync(specPath, "utf8"))
  if (!isBotApiSpec(spec)) throw new Error(`${specPath} is not a Bot API spec`)
  return spec
}
