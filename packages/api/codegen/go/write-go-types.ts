/**
 * @module write-go-types
 *
 * Generates Go struct definitions, union interfaces, and marker method
 * implementations from extracted Telegram Bot API type definitions.
 */
import type { ExtractedTypeShape } from "~/scrape/entity"
import type { NormalType, EntityField } from "~/scrape/type-system"
import { GoSourceBuilder, type GoStructField } from "~/go/go-source-builder"
import { snakeToPascal } from "~/go/go-naming"
import { toGoType, toGoFieldType } from "~/go/go-type-mapping"
import { goEmptyStructTypes, goTypeAliasOverrides, intOrStringFields } from "~/go/go-overrides"

export interface UnionTypeInfo {
  name: string
  markerMethod: string
  variants: string[]
  discriminatorField?: string | undefined
  discriminatorValues?: Record<string, string> | undefined
}

const makeMarkerMethod = (name: string): string =>
  `is${name}`

const fieldToGoStructField = (field: EntityField): GoStructField => {
  if (intOrStringFields.has(field.name)) {
    return {
      name: snakeToPascal(field.name),
      type: field.required ? "IntOrString" : "*IntOrString",
      jsonTag: field.required ? field.name : `${field.name},omitempty`,
    }
  }

  const { goType, omitempty } = toGoFieldType(field.type, field.required)
  return {
    name: snakeToPascal(field.name),
    type: goType,
    jsonTag: omitempty ? `${field.name},omitempty` : field.name,
  }
}

const detectDiscriminator = (
  _unionName: string,
  variantNames: string[],
  allTypes: Map<string, ExtractedTypeShape>
): { field: string; values: Record<string, string> } | undefined => {
  const candidateFields = ["type", "status", "source"]

  for (const candidateField of candidateFields) {
    const values: Record<string, string> = {}
    let allHaveIt = true

    for (const variantName of variantNames) {
      const variant = allTypes.get(variantName)
      if (!variant || variant.type._tag !== "EntityFields") {
        allHaveIt = false
        break
      }

      const field = variant.type.fields.find((f) => f.name === candidateField)
      if (!field || !field.type.isEnum) {
        allHaveIt = false
        break
      }

      const enumValue = field.type.typeNames[0]
      if (!enumValue) {
        allHaveIt = false
        break
      }

      // Strip quotes from enum value: '"solid"' → 'solid'
      values[enumValue.replace(/^"|"$/g, "")] = variantName
    }

    if (allHaveIt && Object.keys(values).length === variantNames.length) {
      return { field: candidateField, values }
    }
  }

  return undefined
}

export const writeGoTypes = (
  types: ExtractedTypeShape[]
): { source: string; unions: UnionTypeInfo[] } => {
  const builder = new GoSourceBuilder()
  builder.addGeneratedHeader().addPackage("tgapi")

  const typeIndex = new Map<string, ExtractedTypeShape>()
  for (const t of types) {
    typeIndex.set(t.typeName, t)
  }

  const unions: UnionTypeInfo[] = []

  // First pass: identify union types
  const unionNames = new Set<string>()
  for (const t of types) {
    if (t.type._tag === "NormalType" && t.type.typeNames.length > 1) {
      unionNames.add(t.typeName)
    }
  }

  // Generate types
  for (const t of types) {
    // Skip types that are hand-written in client.go
    if (goTypeAliasOverrides[t.typeName]) continue

    if (t.type._tag === "EntityFields") {
      if (goEmptyStructTypes.has(t.typeName)) {
        builder.addEmptyStruct(t.typeName, t.description)
        continue
      }

      const fields: GoStructField[] = t.type.fields.map(fieldToGoStructField)

      if (fields.length === 0) {
        builder.addEmptyStruct(t.typeName, t.description)
      } else {
        builder.addStruct(t.typeName, fields, t.description)
      }
    } else {
      // NormalType — either alias or union
      const normalType = t.type as NormalType
      const typeNames = [...normalType.typeNames]

      if (typeNames.length === 1) {
        const goType = toGoType(normalType)
        if (goType === "struct{}") {
          builder.addEmptyStruct(t.typeName, t.description)
        } else {
          builder.addTypeAlias(t.typeName, goType, t.description)
        }
      } else {
        // Union type → Go interface
        const markerMethod = makeMarkerMethod(t.typeName)
        builder.addInterface(t.typeName, markerMethod, t.description)

        // Add marker implementations
        for (const variant of typeNames) {
          builder.addMarkerImpl(variant, markerMethod)
        }
        builder.addBlankLine()

        const disc = detectDiscriminator(t.typeName, typeNames, typeIndex)
        unions.push({
          name: t.typeName,
          markerMethod,
          variants: typeNames,
          discriminatorField: disc?.field,
          discriminatorValues: disc?.values,
        })
      }
    }
  }

  let source = builder.toString()

  // Add json import if json.RawMessage is used in generated code
  if (source.includes("json.RawMessage")) {
    source = source.replace(
      "package tgapi\n",
      'package tgapi\n\nimport "encoding/json"\n'
    )
  }

  return { source, unions }
}
