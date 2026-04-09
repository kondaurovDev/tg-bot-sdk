/**
 * @module go-type-mapping
 *
 * Converts NormalType (with TS type names) to Go type strings.
 * Uses pseudoTypes to distinguish Float (float64) from Integer (int64).
 */
import type { NormalType } from "~/scrape/type-system"
import { isComplexType } from "~/scrape/type-system"
import { goTypeAliasOverrides } from "~/go/go-overrides"

const pseudoFloatTypes = new Set(["Float", "Float number"])

const tsToGoBaseType = (tsType: string, pseudoType?: string): string => {
  if (tsType === "string") return "string"
  if (tsType === "number") {
    if (pseudoType && pseudoFloatTypes.has(pseudoType)) return "float64"
    return "int64"
  }
  if (tsType === "boolean") return "bool"
  if (tsType === "never") return "struct{}"
  return tsType
}

const invertArraySyntax = (tsType: string): string => {
  let dimension = 0
  let base = tsType
  while (base.endsWith("[]")) {
    dimension++
    base = base.slice(0, -2)
  }
  if (dimension === 0) return tsType
  return "[]".repeat(dimension) + base
}

export const toGoType = (normalType: NormalType): string => {
  if (normalType.isEnum) return "string"
  if (normalType.isOverridden) return "string"

  if (normalType.typeNames.length === 1) {
    const tsType = normalType.typeNames[0]
    const pseudoType = normalType.pseudoTypes?.[0]

    if (tsType.endsWith("[]")) {
      const inverted = invertArraySyntax(tsType)
      const baseType = inverted.replace(/^\[]+/, "")
      const prefix = inverted.slice(0, inverted.length - baseType.length)
      const goBase = isComplexType(baseType)
        ? (goTypeAliasOverrides[baseType] ?? baseType)
        : tsToGoBaseType(baseType, pseudoType)
      return prefix + goBase
    }

    if (isComplexType(tsType)) {
      return goTypeAliasOverrides[tsType] ?? tsType
    }

    return tsToGoBaseType(tsType, pseudoType)
  }

  // Multi-type union at field level — use json.RawMessage
  return "json.RawMessage"
}

export const toGoFieldType = (
  normalType: NormalType,
  required: boolean
): { goType: string; omitempty: boolean } => {
  const baseType = toGoType(normalType)

  if (!required) {
    const isSlice = baseType.startsWith("[]")
    if (isSlice) {
      return { goType: baseType, omitempty: true }
    }
    return { goType: `*${baseType}`, omitempty: true }
  }

  return { goType: baseType, omitempty: false }
}
