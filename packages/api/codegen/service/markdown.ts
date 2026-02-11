/**
 * @module markdown
 *
 * Markdown documentation generator.
 *
 * Converts extracted methods and types into plain markdown files.
 * Each Bot API method becomes a file in `methods/`; each type
 * becomes a file in `types/`. A root `README.md` serves as an index.
 */
import { Config, Effect, String as Str } from "effect"
import { writeFile, mkdir } from "fs/promises"
import * as Path from "path"

import type { ExtractedMethodShape } from "~/scrape/entity"
import { removeHtmlTags } from "~/scrape/entity"
import type { ExtractedTypeShape } from "~/scrape/entity"
import { EntityFields, isComplexType, type NormalType } from "~/scrape/type-system"

// ── Helpers ──

const toKebab = (name: string) =>
  Str.snakeToKebab(Str.camelToSnake(name)).replace(/^-/, "")

const escapeMarkdownTable = (text: string) =>
  text.replaceAll("|", "\\|")

const linkSingleType = (name: string, typesPrefix: string): string => {
  const arrayMatch = name.match(/^(.+?)(\[\]+)$/)
  const baseName = arrayMatch ? arrayMatch[1] : name
  const suffix = arrayMatch ? arrayMatch[2] : ""

  if (!isComplexType(baseName)) return `\`${name}\``
  return `[\`${baseName}\`](${typesPrefix}${toKebab(baseName)}.md)${suffix}`
}

const renderLinkedType = (type: NormalType, typesPrefix: string): string => {
  if (type.isOverridden || type.isEnum) return `\`${type.getTsType()}\``
  return type.typeNames
    .map((name) => linkSingleType(name, typesPrefix))
    .join(" \\| ")
}

// ── Method page ──

const makeMethodPage = (method: ExtractedMethodShape): string => {
  const description = method.methodDescription.map(removeHtmlTags).join(" ")
  const lines: string[] = [
    `# ${method.methodName}`,
    "",
    description,
    "",
    `[Telegram docs](https://core.telegram.org/bots/api#${method.methodName.toLowerCase()})`,
    ""
  ]

  if (method.parameters && method.parameters.fields.length > 0) {
    lines.push("## Parameters", "")
    lines.push("| Parameter | Type | Required | Description |")
    lines.push("|-----------|------|----------|-------------|")

    for (const field of method.parameters.fields) {
      const type = renderLinkedType(field.type, "../types/")
      const required = field.required ? "Yes" : "No"
      const desc = escapeMarkdownTable(field.description.join(" "))
      lines.push(`| ${field.name} | ${type} | ${required} | ${desc} |`)
    }

    lines.push("")
  }

  lines.push("## Return type", "")
  lines.push(renderLinkedType(method.returnType, "../types/"), "")

  return lines.join("\n")
}

// ── Type page ──

const makeTypePage = (extracted: ExtractedTypeShape): string => {
  const description = extracted.description.join(" ")
  const lines: string[] = [
    `# ${extracted.typeName}`,
    "",
    description,
    "",
    `[Telegram docs](https://core.telegram.org/bots/api#${extracted.typeName.toLowerCase()})`,
    ""
  ]

  if (extracted.type instanceof EntityFields) {
    lines.push("## Fields", "")
    lines.push("| Field | Type | Required | Description |")
    lines.push("|-------|------|----------|-------------|")

    for (const field of extracted.type.fields) {
      const type = renderLinkedType(field.type, "")
      const required = field.required ? "Yes" : "No"
      const desc = escapeMarkdownTable(field.description.join(" "))
      lines.push(`| ${field.name} | ${type} | ${required} | ${desc} |`)
    }

    lines.push("")
  } else {
    const typeNames = extracted.type.typeNames
    if (typeNames.length > 1) {
      lines.push("## Variants", "")
      for (const name of typeNames) {
        lines.push(`- ${linkSingleType(name, "")}`)
      }
      lines.push("")
    }
  }

  return lines.join("\n")
}

// ── README index ──

const makeReadme = (input: {
  apiVersion: string
  methods: ExtractedMethodShape[]
  types: ExtractedTypeShape[]
}): string => {
  const groups = new Map<string, ExtractedMethodShape[]>()

  for (const method of input.methods) {
    const group = method.groupName ?? "other"
    if (!groups.has(group)) groups.set(group, [])
    groups.get(group)!.push(method)
  }

  const lines: string[] = [
    `# Telegram Bot API ${input.apiVersion}`,
    "",
    "Auto-generated from the [official documentation](https://core.telegram.org/bots/api).",
    "",
    "## Methods",
    ""
  ]

  for (const [group, methods] of groups) {
    lines.push(`### ${group}`, "")
    for (const m of methods) {
      lines.push(`- [${m.methodName}](methods/${toKebab(m.methodName)}.md)`)
    }
    lines.push("")
  }

  lines.push("## Types", "")
  for (const t of input.types) {
    lines.push(`- [${t.typeName}](types/${toKebab(t.typeName)}.md)`)
  }
  lines.push("")

  return lines.join("\n")
}

// ── MarkdownWriterService ──

export class MarkdownWriterService extends Effect.Service<MarkdownWriterService>()(
  "MarkdownWriterService",
  {
    effect: Effect.gen(function* () {
      const writeToDir = yield* Config.array(
        Config.nonEmptyString(),
        "markdown-out-dir"
      )

      const baseDir = Path.join(...writeToDir)
      const methodsDir = Path.join(baseDir, "methods")
      const typesDir = Path.join(baseDir, "types")

      const writeSpecification = (input: {
        apiVersion: string
        types: ExtractedTypeShape[]
        methods: ExtractedMethodShape[]
      }) =>
        Effect.gen(function* () {
          yield* Effect.tryPromise(() =>
            mkdir(methodsDir, { recursive: true })
          )
          yield* Effect.tryPromise(() =>
            mkdir(typesDir, { recursive: true })
          )

          yield* Effect.forEach(
            input.methods,
            (method) => {
              const fileName = `${toKebab(method.methodName)}.md`
              const content = makeMethodPage(method)
              return Effect.tryPromise(() =>
                writeFile(Path.join(methodsDir, fileName), content)
              )
            },
            { concurrency: "unbounded" }
          )

          yield* Effect.forEach(
            input.types,
            (type) => {
              const fileName = `${toKebab(type.typeName)}.md`
              const content = makeTypePage(type)
              return Effect.tryPromise(() =>
                writeFile(Path.join(typesDir, fileName), content)
              )
            },
            { concurrency: "unbounded" }
          )

          yield* Effect.tryPromise(() =>
            writeFile(Path.join(baseDir, "README.md"), makeReadme(input))
          )
        })

      return {
        writeSpecification
      }
    })
  }
) {}
