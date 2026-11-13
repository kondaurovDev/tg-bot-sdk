/**
 * @module markdown
 *
 * Markdown documentation generator for Starlight.
 *
 * Converts extracted methods and types into markdown files with YAML frontmatter.
 * Each Bot API method becomes a file in `methods/`; each type
 * becomes a file in `types/`. An `index.md` serves as the API reference overview.
 */
import { Config, Effect, String as Str } from "effect"
import { writeFile, mkdir } from "fs/promises"
import * as Path from "path"

import { removeHtmlTags, type ExtractedMethodShape, type ExtractedTypeShape } from "~/scrape/entity"
import { EntityFields, isComplexType, NormalType, type EntityField } from "~/scrape/type-system"
import type { SpecType } from "~/scrape/type"

// ── Helpers ──

const toKebab = (name: string) => Str.snakeToKebab(Str.camelToSnake(name)).replace(/^-/, "")

const escapeYaml = (text: string) => text.replaceAll('"', '\\"').replaceAll("\n", " ")

const joinSentences = (parts: string[]) => {
  const text = parts.map(removeHtmlTags).join(". ")
  return text.endsWith(".") ? text : text + "."
}

const linkSingleType = (name: string): string => {
  const arrayMatch = name.match(/^(.+?)(\[\]+)$/)
  const baseName = arrayMatch ? arrayMatch[1] : name
  const suffix = arrayMatch ? arrayMatch[2] : ""

  if (!isComplexType(baseName)) return `\`${name}\``
  return `[\`${baseName}\`](/api/types/${toKebab(baseName)}/)${suffix}`
}

/** Collect every referenced type name from a SpecType tree. */
const collectRefNames = (t: SpecType, out: Set<string> = new Set()): Set<string> => {
  switch (t.kind) {
    case "ref":
      out.add(t.name)
      break
    case "array":
      collectRefNames(t.element, out)
      break
    case "union":
      for (const m of t.members) collectRefNames(m, out)
      break
    case "object":
      for (const f of t.fields) collectRefNames(f.type, out)
      break
    case "primitive":
    case "enum":
    case "raw":
      break
  }
  return out
}

const renderLinkedType = (type: NormalType): string => {
  const spec = type.toSpec()
  if (spec.kind === "raw" || spec.kind === "enum") return `\`${type.getTsType()}\``
  if (spec.kind === "union") {
    return spec.members.map((m) => renderLinkedType(NormalType.fromSpec(m))).join(" \\| ")
  }
  if (spec.kind === "array") {
    return `${renderLinkedType(NormalType.fromSpec(spec.element))}[]`
  }
  // primitive | ref | object
  return linkSingleType(type.getTsType())
}

// ── Usage example ──

const toSnakeCase = (name: string) => Str.camelToSnake(name)

const placeholderForField = (name: string, type: NormalType): string => {
  const spec = type.toSpec()
  const tsType = type.getTsType()
  if (name === "chat_id") return `"YOUR_CHAT_ID"`
  if (name === "text" || name === "caption") return `"Hello!"`
  if (name === "parse_mode") return `"HTML"`
  if (spec.kind === "enum") return `"${spec.values[0]}"`
  if (tsType === "string") return `"..."`
  if (tsType === "number") return `0`
  if (tsType === "boolean") return `true`
  if (spec.kind === "array") return `[]`
  return `{ /* ${tsType} */ }`
}

const usagePreamble = [
  `import { makeTgBotClient } from "@effect-ak/tg-bot-client"`,
  "",
  `const client = makeTgBotClient({ bot_token: "YOUR_BOT_TOKEN" })`,
  ""
]

const makeUsageExample = (method: ExtractedMethodShape): string[] => {
  const snakeName = toSnakeCase(method.methodName)
  const requiredFields = method.parameters?.fields.filter((f) => f.required) ?? []

  if (requiredFields.length === 0) {
    return [
      "```typescript",
      ...usagePreamble,
      `const result = await client.execute("${snakeName}")`,
      "```",
      ""
    ]
  }

  const params = requiredFields.map((f) => `  ${f.name}: ${placeholderForField(f.name, f.type)}`)

  return [
    "```typescript",
    ...usagePreamble,
    `const result = await client.execute("${snakeName}", {`,
    ...params.map((p, i) => (i < params.length - 1 ? p + "," : p)),
    "})",
    "```",
    ""
  ]
}

// ── API Runner block ──

const resolveInputType = (field: EntityField): string => {
  const spec = field.type.toSpec()
  const tsType = field.type.getTsType()
  if (tsType === "boolean") return "boolean"
  if (tsType === "number") return "number"
  if (tsType === "string") return "string"
  if (spec.kind === "enum" || spec.kind === "raw") return "string"
  if (spec.kind === "union") {
    const allStringOrNumber = spec.members.every(
      (m) =>
        m.kind === "primitive" &&
        (m.name === "string" || m.name === "integer" || m.name === "float")
    )
    if (allStringOrNumber && spec.members.length <= 2) return "string"
  }
  return "json"
}

const escapeAttribute = (value: string) => value.replaceAll("&", "&amp;").replaceAll("'", "&#39;")

/**
 * The "try it" widget: only the data — the method and its fields. The
 * website's `<tg-api-runner>` custom element (apps/website/src/api-runner.ts)
 * renders the form, calls the method with the visitor's token, shows the reply.
 */
const makeApiRunnerBlock = (method: ExtractedMethodShape): string[] => {
  const fields = (method.parameters?.fields ?? []).map((f) => ({
    name: f.name,
    type: resolveInputType(f),
    required: f.required
  }))
  return [
    `<tg-api-runner class="not-content" method="${method.methodName}" fields='${escapeAttribute(JSON.stringify(fields))}'></tg-api-runner>`,
    ""
  ]
}

// ── Meta description ──

const makeMethodMetaDescription = (method: ExtractedMethodShape): string => {
  const desc = method.methodDescription.map(removeHtmlTags).join(" ").replace(/\.+$/, "")
  const fields = method.parameters?.fields ?? []
  const required = fields.filter((f) => f.required).map((f) => f.name)

  let meta = `${method.methodName} – Telegram Bot API. ${desc}.`

  if (fields.length > 0) {
    meta += ` ${fields.length} parameters`
    if (required.length > 0) {
      meta += ` (${required.join(", ")} required)`
    }
    meta += "."
  }

  if (meta.length > 160) {
    meta = meta.slice(0, 157) + "..."
  }

  return meta
}

/** Telegram occasionally ships a type as a bare field table, with no prose at all. */
const typeDescriptionFallback = (typeName: string) => `${typeName} is a Telegram Bot API type.`

const hasDescription = (parts: string[]) => parts.some((_) => _.trim().length > 0)

const makeTypeMetaDescription = (extracted: ExtractedTypeShape): string => {
  const desc = extracted.description.map(removeHtmlTags).join(" ").replace(/\.+$/, "")

  let meta = hasDescription(extracted.description)
    ? `${extracted.typeName} – Telegram Bot API type. ${desc}.`
    : `${extracted.typeName} – Telegram Bot API type.`

  if (extracted.type instanceof EntityFields) {
    const total = extracted.type.fields.length
    const required = extracted.type.fields.filter((f) => f.required).length
    meta += ` ${total} fields`
    if (required > 0) meta += `, ${required} required`
    meta += "."
  }

  if (meta.length > 160) {
    meta = meta.slice(0, 157) + "..."
  }

  return meta
}

// ── Method summary ──

const limitPatterns = [
  /(\d[\d,]*[-–]\d[\d,]*\s+characters)/i,
  /(at most \d[\d,]*\s*(?:MB|KB|characters|bytes))/i,
  /(must not exceed \d[\d,]*)/i,
  /(up to \d[\d,]*\s*(?:MB|KB|characters|bytes|messages))/i,
  /(\d[\d,]*\s*(?:MB|KB)\s+in size)/i
]

const extractLimits = (fields: EntityField[]): string[] => {
  const limits: string[] = []

  for (const field of fields) {
    const text = field.description.map(removeHtmlTags).join(" ")
    for (const pattern of limitPatterns) {
      const match = text.match(pattern)
      if (match) {
        limits.push(`${field.name}: ${match[1]}`)
        break
      }
    }
  }

  return limits
}

const makeMethodSummary = (method: ExtractedMethodShape): string[] => {
  const fields = method.parameters?.fields ?? []
  if (fields.length === 0) return []

  const required = fields.filter((f) => f.required)
  const optional = fields.filter((f) => !f.required)
  const limits = extractLimits(fields)

  const lines: string[] = []

  const parts: string[] = []
  if (required.length > 0) {
    parts.push(`**Required**: ${required.map((f) => `\`${f.name}\``).join(", ")}`)
  }
  if (optional.length > 0) {
    parts.push(`**Optional**: ${optional.length} parameters`)
  }

  lines.push(parts.join(" · "), "")

  if (limits.length > 0) {
    lines.push("**Limits**:", "")
    for (const limit of limits) {
      lines.push(`- ${limit}`)
    }
    lines.push("")
  }

  return lines
}

// ── Method group map ──

type MethodGroupMap = Map<string, ExtractedMethodShape[]>

const getMethodPrefix = (name: string): string | undefined => {
  const match = name.match(
    /^(send|get|set|delete|edit|create|answer|ban|unban|pin|unpin|forward|copy|upload|add|remove|close|reopen|hide|unhide|export|revoke|restrict|promote|approve|decline|stop|leave|verify|transfer|upgrade|convert|read|post|repost)/
  )
  return match?.[1]
}

const buildMethodGroupMap = (methods: ExtractedMethodShape[]): MethodGroupMap => {
  const map: MethodGroupMap = new Map()
  for (const method of methods) {
    const prefix = getMethodPrefix(method.methodName)
    if (!prefix) continue
    if (!map.has(prefix)) map.set(prefix, [])
    map.get(prefix)!.push(method)
  }
  return map
}

// ── Structured data ──

const siteUrl = "https://tg-bot-sdk.website"

const makeMethodJsonLd = (method: ExtractedMethodShape): string => {
  const slug = toKebab(method.methodName)
  const desc = method.methodDescription.map(removeHtmlTags).join(" ")
  const data = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${method.methodName} – Telegram Bot API`,
    description: desc,
    url: `${siteUrl}/api/methods/${slug}/`,
    proficiencyLevel: "Beginner",
    about: {
      "@type": "SoftwareApplication",
      name: "Telegram Bot API",
      applicationCategory: "DeveloperApplication"
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Telegram Bot SDK",
      url: siteUrl
    }
  }
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`
}

const makeTypeJsonLd = (extracted: ExtractedTypeShape): string => {
  const slug = toKebab(extracted.typeName)
  const desc = hasDescription(extracted.description)
    ? extracted.description.map(removeHtmlTags).join(" ")
    : typeDescriptionFallback(extracted.typeName)
  const data = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${extracted.typeName} – Telegram Bot API Type`,
    description: desc,
    url: `${siteUrl}/api/types/${slug}/`,
    proficiencyLevel: "Beginner",
    about: {
      "@type": "SoftwareApplication",
      name: "Telegram Bot API",
      applicationCategory: "DeveloperApplication"
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Telegram Bot SDK",
      url: siteUrl
    }
  }
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`
}

// ── Method page ──

const makeMethodPage = (method: ExtractedMethodShape, groupMap: MethodGroupMap): string => {
  const description = joinSentences(method.methodDescription)
  const metaDescription = makeMethodMetaDescription(method)
  const tgLink = `[↗](https://core.telegram.org/bots/api#${method.methodName.toLowerCase()})`
  const lines: string[] = [
    "---",
    `title: "${escapeYaml(method.methodName)} – Telegram Bot API"`,
    `description: "${escapeYaml(metaDescription)}"`,
    "editUrl: false",
    "---",
    "",
    makeMethodJsonLd(method),
    "",
    `<style>.sl-markdown-content a{text-decoration:none;color:var(--sl-color-text-accent)}.sl-markdown-content a code{color:var(--sl-color-text-accent)}</style>`,
    "",
    `**Returns** ${renderLinkedType(method.returnType)} ${tgLink}`,
    "",
    description,
    "",
    ...makeMethodSummary(method)
  ]

  lines.push(
    `<details>`,
    `<summary style="cursor:pointer;font-weight:600;font-size:14px;padding:8px 0;">Try it</summary>`,
    ""
  )
  lines.push(...makeApiRunnerBlock(method))
  lines.push(`</details>`, "")

  lines.push(
    `<details>`,
    `<summary style="cursor:pointer;font-weight:600;font-size:14px;padding:8px 0;">TypeScript example · @effect-ak/tg-bot-client</summary>`,
    ""
  )
  lines.push(...makeUsageExample(method))
  lines.push(`</details>`, "")

  if (method.parameters && method.parameters.fields.length > 0) {
    lines.push("## Parameters", "")

    for (const field of method.parameters.fields) {
      const type = renderLinkedType(field.type)
      const req = field.required ? " `Required`" : ""
      const desc = joinSentences(field.description)
      lines.push(`**${field.name}** ${type}${req}\\`)
      lines.push(desc, "")
    }
  }

  const prefix = getMethodPrefix(method.methodName)
  const related = prefix
    ? (groupMap.get(prefix) ?? []).filter((m) => m.methodName !== method.methodName)
    : []
  if (related.length > 0) {
    const links = related
      .map((m) => `[${m.methodName}](/api/methods/${toKebab(m.methodName)}/)`)
      .join(" · ")
    lines.push("## Related methods", "", links, "")
  }

  return lines.join("\n")
}

// ── Reverse index: type name → methods that use it ──

type TypeUsageMap = Map<string, ExtractedMethodShape[]>

const buildTypeUsageMap = (methods: ExtractedMethodShape[]): TypeUsageMap => {
  const map: TypeUsageMap = new Map()

  const addUsage = (typeName: string, method: ExtractedMethodShape) => {
    if (!map.has(typeName)) map.set(typeName, [])
    const list = map.get(typeName)!
    if (!list.includes(method)) list.push(method)
  }

  const collectFromType = (type: NormalType, method: ExtractedMethodShape) => {
    for (const name of collectRefNames(type.toSpec())) {
      if (isComplexType(name)) addUsage(name, method)
    }
  }

  for (const method of methods) {
    collectFromType(method.returnType, method)
    if (method.parameters) {
      for (const field of method.parameters.fields) {
        collectFromType(field.type, method)
      }
    }
  }

  return map
}

// ── Type page ──

const makeTypePage = (extracted: ExtractedTypeShape, usageMap: TypeUsageMap): string => {
  const description = hasDescription(extracted.description)
    ? joinSentences(extracted.description)
    : typeDescriptionFallback(extracted.typeName)
  const metaDescription = makeTypeMetaDescription(extracted)
  const tgLink = `[↗](https://core.telegram.org/bots/api#${extracted.typeName.toLowerCase()})`
  const lines: string[] = [
    "---",
    `title: "${escapeYaml(extracted.typeName)} – Telegram Bot API Type"`,
    `description: "${escapeYaml(metaDescription)}"`,
    "editUrl: false",
    "---",
    "",
    makeTypeJsonLd(extracted),
    "",
    `<style>.sl-markdown-content a{text-decoration:none;color:var(--sl-color-text-accent)}.sl-markdown-content a code{color:var(--sl-color-text-accent)}</style>`,
    "",
    `${description} ${tgLink}`,
    ""
  ]

  if (extracted.type instanceof EntityFields) {
    const allFields = extracted.type.fields
    const requiredFields = allFields.filter((f) => f.required)

    // Summary
    const parts = [`${allFields.length} fields`]
    if (requiredFields.length > 0) parts.push(`${requiredFields.length} required`)
    lines.push(parts.join(", ") + ".", "")

    // Used by methods (before Fields)
    const usedBy = usageMap.get(extracted.typeName)
    if (usedBy && usedBy.length > 0) {
      lines.push("## Used by", "")
      for (const method of usedBy) {
        lines.push(`- [${method.methodName}](/api/methods/${toKebab(method.methodName)}/)`)
      }
      lines.push("")
    }

    // Full fields with descriptions
    lines.push("## Fields", "")
    for (const field of allFields) {
      const type = renderLinkedType(field.type)
      const req = field.required ? " `Required`" : ""
      const desc = joinSentences(field.description)
      lines.push(`**${field.name}** ${type}${req}\\`)
      lines.push(desc, "")
    }
  } else {
    const spec = extracted.type.toSpec()
    const variantNames =
      spec.kind === "union" ? spec.members.flatMap((m) => (m.kind === "ref" ? [m.name] : [])) : []
    if (variantNames.length > 1) {
      lines.push("## Variants", "")
      for (const name of variantNames) {
        lines.push(`- ${linkSingleType(name)}`)
      }
      lines.push("")
    }

    // Used by methods (for union types too)
    const usedBy = usageMap.get(extracted.typeName)
    if (usedBy && usedBy.length > 0) {
      lines.push("## Used by", "")
      for (const method of usedBy) {
        lines.push(`- [${method.methodName}](/api/methods/${toKebab(method.methodName)}/)`)
      }
      lines.push("")
    }
  }

  return lines.join("\n")
}

// ── Index page ──

const makeIndex = (input: {
  apiVersion: string
  methods: ExtractedMethodShape[]
  types: ExtractedTypeShape[]
}): string => {
  const sorted = [...input.methods].sort((a, b) => a.methodName.localeCompare(b.methodName))

  const links = sorted
    .map((m) => `[${m.methodName}](/api/methods/${toKebab(m.methodName)}/)`)
    .join(" · ")

  const lines: string[] = [
    "---",
    `title: "Methods"`,
    `description: "Telegram Bot API ${input.apiVersion} — ${input.methods.length} methods"`,
    `tableOfContents: false`,
    `editUrl: false`,
    "---",
    "",
    `<style>.sl-markdown-content a{text-decoration:none;color:var(--sl-color-text-accent)}.sl-markdown-content a code{color:var(--sl-color-text-accent)}</style>`,
    "",
    `**${input.methods.length}** methods from Bot API **${input.apiVersion}**. See also: [Types](/api/types/).`,
    "",
    links,
    ""
  ]

  return lines.join("\n")
}

// ── Types index page ──

const makeTypesIndex = (input: { apiVersion: string; types: ExtractedTypeShape[] }): string => {
  const sorted = [...input.types].sort((a, b) => a.typeName.localeCompare(b.typeName))

  const links = sorted.map((t) => `[${t.typeName}](/api/types/${toKebab(t.typeName)}/)`).join(" · ")

  const lines: string[] = [
    "---",
    `title: "Types"`,
    `description: "Telegram Bot API ${input.apiVersion} — ${input.types.length} types"`,
    `tableOfContents: false`,
    `editUrl: false`,
    "---",
    "",
    `<style>.sl-markdown-content a{text-decoration:none;color:var(--sl-color-text-accent)}.sl-markdown-content a code{color:var(--sl-color-text-accent)}</style>`,
    "",
    `**${input.types.length}** types from Bot API **${input.apiVersion}**. See also: [Methods](/api/).`,
    "",
    links,
    ""
  ]

  return lines.join("\n")
}

// ── MarkdownWriterService ──

export class MarkdownWriterService extends Effect.Service<MarkdownWriterService>()(
  "MarkdownWriterService",
  {
    effect: Effect.gen(function* () {
      const writeToDir = yield* Config.array(Config.nonEmptyString(), "markdown-out-dir")

      const baseDir = Path.join(...writeToDir)
      const methodsDir = Path.join(baseDir, "methods")
      const typesDir = Path.join(baseDir, "types")

      const writeSpecification = (input: {
        apiVersion: string
        types: ExtractedTypeShape[]
        methods: ExtractedMethodShape[]
      }) =>
        Effect.gen(function* () {
          yield* Effect.tryPromise(() => mkdir(methodsDir, { recursive: true }))
          yield* Effect.tryPromise(() => mkdir(typesDir, { recursive: true }))

          const groupMap = buildMethodGroupMap(input.methods)

          yield* Effect.forEach(
            input.methods,
            (method) => {
              const fileName = `${toKebab(method.methodName)}.md`
              const content = makeMethodPage(method, groupMap)
              return Effect.tryPromise(() => writeFile(Path.join(methodsDir, fileName), content))
            },
            { concurrency: "unbounded" }
          )

          const usageMap = buildTypeUsageMap(input.methods)

          yield* Effect.forEach(
            input.types,
            (type) => {
              const fileName = `${toKebab(type.typeName)}.md`
              const content = makeTypePage(type, usageMap)
              return Effect.tryPromise(() => writeFile(Path.join(typesDir, fileName), content))
            },
            { concurrency: "unbounded" }
          )

          yield* Effect.tryPromise(() =>
            writeFile(Path.join(baseDir, "index.md"), makeIndex(input))
          )

          yield* Effect.tryPromise(() =>
            writeFile(Path.join(typesDir, "index.md"), makeTypesIndex(input))
          )
        })

      return {
        writeSpecification
      }
    })
  }
) {}
