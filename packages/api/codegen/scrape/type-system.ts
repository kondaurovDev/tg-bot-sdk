/**
 * @module type-system
 *
 * Bridges the HTML-derived pseudo-types to the structured {@link SpecType}
 * algebra defined in `~/scrape/type`.
 *
 * Key exports:
 * - {@link NormalType} — thin wrapper around a {@link SpecType} that knows
 *   how to render itself to TS.
 * - {@link EntityFields} — object type with named fields (collected from
 *   HTML tables).
 * - {@link extractEnumFromTypeDescription} — picks string-literal enums out
 *   of the docs prose.
 */
import { Array, Data, Either } from "effect"

import { fieldOverrides, globalFieldOverrides } from "~/scrape/overrides"
import {
  enumOf,
  parsePseudoType,
  renderTypeToTs,
  type SpecType
} from "~/scrape/type"

// ── Shared types ──

export interface ExtractedEntityField {
  entityName: string
  fieldName: string
  pseudoType: string
  description: string[]
}

export const startsWithUpperCase = (input: string) =>
  input.length > 0 && input.at(0)?.toUpperCase() == input.at(0)

export const isComplexType = startsWithUpperCase

export { INITIALING_MINI_APPS } from "./constants"

// ── NormalType errors ──

interface ErrorShape {
  error: [
    "Failed",
    "ReturnTypeSentenceNotFound",
    "EmptyType",
    "NoEnumFound"
  ][number]
  details: {
    entityName?: string
    typeName?: string
  }
}

export class NormalTypeError extends Data.TaggedError(
  "NormalTypeError"
)<ErrorShape> {
  static make(error: ErrorShape["error"], details: ErrorShape["details"]) {
    return new NormalTypeError({ error, details })
  }

  static left(...input: Parameters<typeof NormalTypeError.make>) {
    return Either.left(NormalTypeError.make(...input))
  }
}

// ── Enum extraction ──

const regexQuotes = /["\u201C]([^"\u201D]+)["\u201D]/g
const regexFallback =
  /(?:must be|always|can be)\s+(?:one\s+of\s+)?["\u201C]?([^"\u201D.,]+)["\u201D]?/i
const enumRegex = /^[A-Za-z0-9_/\p{Emoji}\u200D]+$/u

const enumPresenceIndicatiors = ["must be", "always", "one of", "can be"]

const hasEnum = (line: string) =>
  enumPresenceIndicatiors.map((_) => line.includes(_)).includes(true)

export function extractEnumFromTypeDescription(
  description: string[]
): string[] {
  const enumValues: string[] = []

  for (const line of description) {
    if (!line || !hasEnum(line)) continue

    let match
    while ((match = regexQuotes.exec(line)) !== null) {
      enumValues.push(
        ...match[1].split(/",\s*|\u201D,\s*|\u201C|\u201D|,/).map((s) => s.trim())
      )
    }

    if (enumValues.length === 0) {
      const fallbackMatch = regexFallback.exec(line)
      if (fallbackMatch) {
        enumValues.push(
          ...fallbackMatch[1].split(/,\s*|or\s+/).map((s) => s.trim())
        )
      }
    }
  }

  return enumValues.filter((_) => enumRegex.test(_))
}

// ── NormalType factory ──

const makeSpecFor = (
  input: ExtractedEntityField
): Either.Either<SpecType, NormalTypeError> => {
  const global = globalFieldOverrides.find((g) => g.match(input))
  if (global) return Either.right(global.override)

  if (input.pseudoType === "String") {
    const enums = extractEnumFromTypeDescription(input.description)
    if (Array.isNonEmptyArray(enums)) return Either.right(enumOf(...enums))
  }

  const override = fieldOverrides[input.entityName]?.[input.fieldName]
  if (override) return Either.right(override)

  const parsed = parsePseudoType(input.pseudoType)
  if (!parsed)
    return NormalTypeError.left("EmptyType", { typeName: input.pseudoType })
  return Either.right(parsed)
}

// ── NormalType class ──

export class NormalType extends Data.TaggedClass("NormalType")<{
  spec: SpecType
}> {
  getTsType(typeNamespace?: string) {
    return renderTypeToTs(this.spec, typeNamespace)
  }

  toSpec(): SpecType {
    return this.spec
  }

  static fromSpec(spec: SpecType) {
    return new NormalType({ spec })
  }

  static makeFrom(input: ExtractedEntityField) {
    return makeSpecFor(input).pipe(
      Either.andThen((spec) => new NormalType({ spec }))
    )
  }
}

// ── EntityFields ──

export interface EntityField {
  name: string
  type: NormalType
  description: string[]
  required: boolean
}

export class EntityFields extends Data.TaggedClass("EntityFields")<{
  fields: EntityField[]
}> {}
