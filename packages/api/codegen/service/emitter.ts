/**
 * @module emitter
 *
 * String-based TypeScript code emitter. Pure text-in/text-out helpers that
 * replace ts-morph for our codegen output. Resulting source is piped through
 * prettier for final formatting.
 */
import prettier from "prettier"

import type { ExtractedTypeShape } from "~/scrape/entity"

// ── JSDoc ──

const escapeJsDoc = (text: string): string => text.replace(/\*\//g, "*\\/")

const indentLines = (text: string, indent: string): string =>
  text
    .split("\n")
    .map((line) => indent + line)
    .join("\n")

export interface EmitJsDocInput {
  description?: string[] | undefined
  /** Link appended as `@see` (typically a URL to the docs site). */
  seeUrl?: string | undefined
}

/** Build a `/** ... *\u200B/` block. Returns empty string if nothing to show. */
export const emitJsDoc = ({ description, seeUrl }: EmitJsDocInput): string => {
  const lines: string[] = []
  for (const p of description ?? []) {
    for (const chunk of p.split("\n")) {
      const trimmed = chunk.trim()
      if (trimmed.length > 0) lines.push(escapeJsDoc(trimmed))
    }
  }
  if (seeUrl) lines.push(`@see ${seeUrl}`)
  if (lines.length === 0) return ""
  if (lines.length === 1 && !seeUrl) return `/** ${lines[0]} */`
  return "/**\n" + lines.map((l) => ` * ${l}`).join("\n") + "\n */"
}

// ── Low-level emitters ──

export interface EmitProperty {
  name: string
  type: string
  optional?: boolean
  description?: string[] | undefined
}

export interface EmitMethodParameter {
  name: string
  type: string
}

export interface EmitMethodSignature {
  name: string
  parameters: EmitMethodParameter[]
  returnType: string
  description?: string[] | undefined
  seeUrl?: string | undefined
}

export interface EmitInterfaceBody {
  properties?: EmitProperty[]
  methods?: EmitMethodSignature[]
  description?: string[] | undefined
  seeUrl?: string | undefined
}

const emitProperty = ({
  name,
  type,
  optional,
  description
}: EmitProperty): string => {
  const line = `  ${name}${optional ? "?" : ""}: ${type}`
  const jsdoc = emitJsDoc({ description })
  return jsdoc ? `${indentLines(jsdoc, "  ")}\n${line}` : line
}

const emitMethodSignature = ({
  name,
  parameters,
  returnType,
  description,
  seeUrl
}: EmitMethodSignature): string => {
  const params = parameters.map((p) => `${p.name}: ${p.type}`).join(", ")
  const line = `  ${name}(${params}): ${returnType}`
  const jsdoc = emitJsDoc({ description, seeUrl })
  return jsdoc ? `${indentLines(jsdoc, "  ")}\n${line}` : line
}

const prependJsDoc = (jsdoc: string, body: string): string =>
  jsdoc ? `${jsdoc}\n${body}` : body

export const emitInterface = (
  name: string,
  body: EmitProperty[] | EmitInterfaceBody
): string => {
  const {
    properties = [],
    methods = [],
    description,
    seeUrl
  } = Array.isArray(body) ? { properties: body } : body
  const members = [
    ...properties.map(emitProperty),
    ...methods.map(emitMethodSignature)
  ]
  const iface =
    members.length === 0
      ? `export interface ${name} {}`
      : `export interface ${name} {\n${members.join("\n")}\n}`
  return prependJsDoc(emitJsDoc({ description, seeUrl }), iface)
}

export interface EmitTypeAliasOptions {
  description?: string[] | undefined
  seeUrl?: string | undefined
}

export const emitTypeAlias = (
  name: string,
  type: string,
  options: EmitTypeAliasOptions = {}
): string =>
  prependJsDoc(emitJsDoc(options), `export type ${name} = ${type}`)

export const emitNamespaceImport = (
  alias: string,
  from: string,
  typeOnly = false
): string =>
  `import${typeOnly ? " type" : ""} * as ${alias} from "${from}"`

// ── High-level emitters ──

export interface EmitExtractedTypeOptions {
  namespace?: string | undefined
  seeUrl?: string | undefined
}

/**
 * Emit either `export interface` or `export type X = ...` based on shape.
 *
 * Only the top-level declaration gets a JSDoc block (description + @see).
 * Field-level descriptions are intentionally omitted — most Telegram field
 * descriptions just rephrase the field name ("is_bot — True, if this user
 * is a bot") and bloat the `.d.ts` without adding signal. Per-field docs
 * live on method `Input` interfaces (see `renderMethods`), where they
 * surface constraints during code authoring.
 */
export const emitExtractedType = (
  type: ExtractedTypeShape,
  options: EmitExtractedTypeOptions = {}
): string => {
  const { namespace, seeUrl } = options
  if (type.type._tag == "EntityFields") {
    return emitInterface(type.typeName, {
      description: type.description,
      seeUrl,
      properties: type.type.fields.map((f) => ({
        name: f.name,
        type: f.type.getTsType(namespace),
        optional: !f.required
      }))
    })
  }
  return emitTypeAlias(type.typeName, type.type.getTsType(namespace), {
    description: type.description,
    seeUrl
  })
}

// ── File assembly ──

const GENERATED_HEADER = "// GENERATED CODE"

export const assembleFile = (
  parts: ReadonlyArray<string | undefined>
): string =>
  [GENERATED_HEADER, ...parts.filter((p): p is string => !!p)].join("\n\n") +
  "\n"

export const formatTsSource = async (source: string): Promise<string> => {
  const config = await prettier.resolveConfig(process.cwd())
  return prettier.format(source, {
    ...config,
    parser: "typescript"
  })
}
