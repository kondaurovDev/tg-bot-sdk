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
import { enumOf, parsePseudoType, renderTypeToTs, type SpecType } from "~/scrape/type"

// ── Shared types ──

export interface ExtractedEntityField {
  entityName: string
  fieldName: string
  pseudoType: string
  description: string[]
  /**
   * Type to use when no override gives one, instead of parsing `pseudoType` —
   * for cells that are not a type name, such as the Mini Apps "Function".
   */
  defaultType?: SpecType
}

export const startsWithUpperCase = (input: string) =>
  input.length > 0 && input.at(0)?.toUpperCase() == input.at(0)

export const isComplexType = startsWithUpperCase

export { INITIALING_MINI_APPS } from "./constants"

// ── NormalType errors ──

interface ErrorShape {
  error: ["Failed", "ReturnTypeSentenceNotFound", "EmptyType", "NoEnumFound"][number]
  details: {
    entityName?: string
    typeName?: string
  }
}

export class NormalTypeError extends Data.TaggedError("NormalTypeError")<ErrorShape> {
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

const enumIndicatorRegex = /\b(?:must be|always|one of|can be|either)\b/i

/**
 * A quoted list counts only when an indicator is directly followed by its
 * first value: "One of “forehead”, …", "Must be either “approve”…",
 * "Currently, always “XTR”". That keeps out sentences that merely mention a
 * value of another field: "Can be available only for “invoice_payment”
 * transactions". Case-insensitive, since sentences start with the indicator.
 */
const quotedListRegex =
  /\b(?:must be|always|one of|can be|either)\s+(?:either\s+|one\s+of\s+)?["\u201C]/i

export function extractEnumFromTypeDescription(description: string[]): string[] {
  const enumValues: string[] = []

  for (const line of description) {
    if (!line || !enumIndicatorRegex.test(line)) continue

    if (quotedListRegex.test(line)) {
      let match
      while ((match = regexQuotes.exec(line)) !== null) {
        enumValues.push(...match[1].split(/",\s*|\u201D,\s*|\u201C|\u201D|,/).map((s) => s.trim()))
      }
    }

    // Unquoted single values: "Type of the result, must be article"
    if (enumValues.length === 0) {
      const fallbackMatch = regexFallback.exec(line)
      if (fallbackMatch) {
        enumValues.push(...fallbackMatch[1].split(/,\s*|or\s+/).map((s) => s.trim()))
      }
    }
  }

  return enumValues.filter((_) => enumRegex.test(_))
}

// ── NormalType factory ──

/**
 * What the docs alone say about a field, before any override: an enum picked
 * out of the prose of a String field, or the parsed type cell.
 */
export const inferFieldSpec = (input: ExtractedEntityField): SpecType | null => {
  if (input.pseudoType === "String") {
    const enums = extractEnumFromTypeDescription(input.description)
    if (Array.isNonEmptyArray(enums)) return enumOf(...enums)
  }
  return parsePseudoType(input.pseudoType)
}

// An explicit override wins over anything inferred from the docs.
const makeSpecFor = (input: ExtractedEntityField): Either.Either<SpecType, NormalTypeError> => {
  const global = globalFieldOverrides.find((g) => g.match(input))
  if (global) return Either.right(global.override)

  const override = fieldOverrides[input.entityName]?.[input.fieldName]
  if (override) return Either.right(override)

  if (input.defaultType) return Either.right(input.defaultType)

  const inferred = inferFieldSpec(input)
  if (!inferred) return NormalTypeError.left("EmptyType", { typeName: input.pseudoType })
  return Either.right(inferred)
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
    return makeSpecFor(input).pipe(Either.andThen((spec) => new NormalType({ spec })))
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
