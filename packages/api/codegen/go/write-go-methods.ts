/**
 * @module write-go-methods
 *
 * Generates Go input structs and ApiMethod descriptor variables
 * from extracted Telegram Bot API method definitions.
 */
import type { ExtractedMethodShape } from "~/scrape/entity"
import type { ExtractedTypeShape } from "~/scrape/entity"
import type { NormalType } from "~/scrape/type-system"
import { GoSourceBuilder, type GoStructField } from "~/go/go-source-builder"
import { snakeToPascal, camelToPascal } from "~/go/go-naming"
import { toGoType, toGoFieldType } from "~/go/go-type-mapping"
import { intOrStringFields } from "~/go/go-overrides"

const makeInputName = (methodName: string): string =>
  `${camelToPascal(methodName)}Input`

const methodReturnGoType = (
  returnType: NormalType,
  unionNames: Set<string>
): string => {
  const typeNames = returnType.typeNames

  if (typeNames.length === 1) {
    return toGoType(returnType)
  }

  // Multi-type return: Message | boolean → json.RawMessage
  const hasBoolean = typeNames.includes("boolean")
  const complexTypes = typeNames.filter((t) => t !== "boolean")

  if (hasBoolean && complexTypes.length === 1) {
    return "json.RawMessage"
  }

  // Check if it's a known union type
  for (const name of unionNames) {
    if (typeNames.join(" | ") === name) return name
  }

  return "json.RawMessage"
}

export const writeGoMethods = (
  methods: ExtractedMethodShape[],
  types: ExtractedTypeShape[]
): string => {
  const builder = new GoSourceBuilder()
  builder.addGeneratedHeader().addPackage("tgapi")

  // Collect union type names for return type resolution
  const unionNames = new Set<string>()
  for (const t of types) {
    if (t.type._tag === "NormalType" && t.type.typeNames.length > 1) {
      unionNames.add(t.typeName)
    }
  }

  // Check if we need encoding/json import (for json.RawMessage return types)
  const needsJsonImport = methods.some(
    (m) => m.returnType.typeNames.length > 1
  )
  if (needsJsonImport) {
    builder.addImport("encoding/json")
  }

  // Generate method descriptors
  builder.addComment(["Method descriptors linking API method names to their typed input/output."])
  builder.addRaw("var (")

  for (const method of methods) {
    const inputName = makeInputName(method.methodName)
    const returnGoType = methodReturnGoType(method.returnType, unionNames)
    const varName = camelToPascal(method.methodName)
    builder.addRaw(
      `\t${varName} = ApiMethod[${inputName}, ${returnGoType}]{Name: "${method.methodName}"}`
    )
  }

  builder.addRaw(")")
  builder.addBlankLine()

  // Generate input structs
  for (const method of methods) {
    const inputName = makeInputName(method.methodName)

    if (!method.parameters || method.parameters.fields.length === 0) {
      builder.addEmptyStruct(inputName, method.methodDescription)
      continue
    }

    const fields: GoStructField[] = method.parameters.fields.map((field) => {
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
    })

    builder.addStruct(inputName, fields, method.methodDescription)
  }

  return builder.toString()
}
