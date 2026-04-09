/**
 * @module write-go-unmarshal
 *
 * Generates custom UnmarshalJSON functions for union types
 * using discriminator-based dispatch.
 */
import type { UnionTypeInfo } from "~/go/write-go-types"
import { GoSourceBuilder } from "~/go/go-source-builder"

const snakeToCamel = (s: string): string => {
  const parts = s.split("_")
  return [parts[0], ...parts.slice(1).map((p) => p[0].toUpperCase() + p.slice(1))].join("")
}

export const writeGoUnmarshal = (unions: UnionTypeInfo[]): string => {
  const discriminatedUnions = unions.filter(
    (u) => u.discriminatorField && u.discriminatorValues
  )

  if (discriminatedUnions.length === 0) return ""

  const builder = new GoSourceBuilder()
  builder.addGeneratedHeader().addPackage("tgapi")
  builder.addImport("encoding/json", "fmt")

  for (const union of discriminatedUnions) {
    const funcName = `unmarshal${union.name}`
    const discField = union.discriminatorField!
    const discValues = union.discriminatorValues!

    // Discriminator struct
    const discStructField = snakeToCamel(discField)
    const discStructFieldPascal = discStructField[0].toUpperCase() + discStructField.slice(1)

    builder.addFunc(
      undefined,
      funcName,
      "data []byte",
      `(${union.name}, error)`,
      [
        `var disc struct {`,
        `\t${discStructFieldPascal} string \`json:"${discField}"\``,
        `}`,
        `if err := json.Unmarshal(data, &disc); err != nil {`,
        `\treturn nil, err`,
        `}`,
        `switch disc.${discStructFieldPascal} {`,
        ...Object.entries(discValues).flatMap(([value, typeName]) => [
          `case "${value}":`,
          `\tvar v ${typeName}`,
          `\treturn &v, json.Unmarshal(data, &v)`,
        ]),
        `default:`,
        `\treturn nil, fmt.Errorf("unknown ${union.name} ${discField}: %q", disc.${discStructFieldPascal})`,
        `}`,
      ]
    )
  }

  return builder.toString()
}
