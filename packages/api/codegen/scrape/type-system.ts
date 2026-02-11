/**
 * @module type-system
 *
 * Type representation and conversion layer.
 *
 * Defines how Telegram API types (primitives, unions, arrays, objects) are
 * represented internally and converted to TypeScript types.
 *
 * Key exports:
 * - {@link NormalType} — a single type (primitive, union, or complex reference)
 * - {@link EntityFields} — an object type with named fields
 * - {@link mapPseudoTypeToTsType} — conversion helper
 * - {@link fieldOverrides} constants for types that can't be inferred from HTML (in `overrides.ts`)
 */
import { Array, Data, Either, Match, pipe } from "effect"

import { fieldOverrides } from "~/scrape/overrides"

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

// ── NormalType shape ──

export interface NormalTypeShape {
  typeNames: Array.NonEmptyReadonlyArray<string>
  isEnum?: boolean
  isOverridden?: boolean
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

// ── Pseudo-type mapping ──

const array_of_label = "Array of"
const array_of_regex = /array of/gi

export const mapPseudoTypeToTsType = (typeName: string) =>
  pipe(
    Match.value(typeName),
    Match.when("String", () => "string"),
    Match.when("Integer", () => "number"),
    Match.when("Int", () => "number"),
    Match.when("Float", () => "number"),
    Match.when("Boolean", () => "boolean"),
    Match.when("True", () => "boolean"),
    Match.when("False", () => "boolean"),
    Match.orElse(() => typeName)
  )

const makeArray = (input: string) => {
  const dimension = [...input.matchAll(array_of_regex)].length
  const typeName = mapPseudoTypeToTsType(
    input.replaceAll(array_of_regex, "").trim()
  )

  return `${typeName}${"[]".repeat(dimension)}`
}

export const makeNormalTypeFromPseudoTypes = (
  pseudoType: string
): Either.Either<NormalTypeShape, NormalTypeError> => {
  if (pseudoType.includes(" or ")) {
    const typeNames = pseudoType.split(" or ").map(mapPseudoTypeToTsType)

    if (Array.isNonEmptyArray(typeNames) && typeNames[0].length > 0) {
      return Either.right({ typeNames })
    }

    return NormalTypeError.left("EmptyType", { typeName: pseudoType })
  } else if (pseudoType.startsWith(array_of_label)) {
    const typeName = mapPseudoTypeToTsType(makeArray(pseudoType))

    if (typeName.length > 0) {
      return Either.right({ typeNames: [typeName] })
    }

    return NormalTypeError.left("EmptyType", { typeName: pseudoType })
  } else {
    const typeNames = Array.make(mapPseudoTypeToTsType(pseudoType))

    if (typeNames[0].length == 0) {
      return NormalTypeError.left("EmptyType", { typeName: pseudoType })
    }

    return Either.right({ typeNames })
  }
}

// ── NormalType factory ──

const makeNormalTypeFrom = (
  input: ExtractedEntityField
): Either.Either<NormalTypeShape, NormalTypeError> => {
  if (input.fieldName.endsWith("parse_mode")) {
    return Either.right({
      typeNames: [`"HTML" | "MarkdownV2"`],
      isOverridden: true
    })
  }

  if (input.pseudoType == "String") {
    const enums = extractEnumFromTypeDescription(input.description)

    if (Array.isNonEmptyArray(enums)) {
      return Either.right({
        typeNames: Array.map(enums, (_) => `"${_}"`),
        isEnum: true
      })
    }
  }

  const override = fieldOverrides[input.entityName]?.[input.fieldName]

  if (override) {
    return Either.right({ ...override, isOverridden: true })
  }

  return makeNormalTypeFromPseudoTypes(input.pseudoType)
}

// ── NormalType class ──

const union = (input: Array.NonEmptyReadonlyArray<string>) => input.join(" | ")

export class NormalType extends Data.TaggedClass(
  "NormalType"
)<NormalTypeShape> {
  getTsType(typeNamespace?: string) {
    if (this.isOverridden) return this.typeNames[0]
    if (this.isEnum) return union(this.typeNames)
    if (!typeNamespace) return union(this.typeNames)
    const prefixed = Array.map(this.typeNames, (_) =>
      isComplexType(_) ? `${typeNamespace}.${_}` : _
    )
    return union(prefixed)
  }

  static makeFromNames(...names: Array.NonEmptyArray<string>) {
    return new NormalType({
      typeNames: Array.map(names, mapPseudoTypeToTsType)
    })
  }

  static makeFrom(input: ExtractedEntityField) {
    return makeNormalTypeFrom(input).pipe(
      Either.andThen((_) => new NormalType(_))
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
