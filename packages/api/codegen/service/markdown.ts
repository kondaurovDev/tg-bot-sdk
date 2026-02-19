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

import type { ExtractedMethodShape } from "~/scrape/entity"
import { removeHtmlTags } from "~/scrape/entity"
import type { ExtractedTypeShape } from "~/scrape/entity"
import {
  EntityFields,
  isComplexType,
  type EntityField,
  type NormalType
} from "~/scrape/type-system"

// ── Helpers ──

const toKebab = (name: string) =>
  Str.snakeToKebab(Str.camelToSnake(name)).replace(/^-/, "")

const escapeYaml = (text: string) =>
  text.replaceAll('"', '\\"').replaceAll("\n", " ")

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

const renderLinkedType = (type: NormalType): string => {
  if (type.isOverridden || type.isEnum) return `\`${type.getTsType()}\``
  return type.typeNames
    .map((name) => linkSingleType(name))
    .join(" \\| ")
}

// ── Usage example ──

const toSnakeCase = (name: string) => Str.camelToSnake(name)

const placeholderForField = (name: string, type: NormalType): string => {
  const tsType = type.getTsType()
  if (name === "chat_id") return `"YOUR_CHAT_ID"`
  if (name === "text" || name === "caption") return `"Hello!"`
  if (name === "parse_mode") return `"HTML"`
  if (type.isEnum) return type.typeNames[0]
  if (tsType === "string") return `"..."`
  if (tsType === "number") return `0`
  if (tsType === "boolean") return `true`
  if (tsType.endsWith("[]")) return `[]`
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

  const params = requiredFields.map(
    (f) => `  ${f.name}: ${placeholderForField(f.name, f.type)}`
  )

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
  const tsType = field.type.getTsType()
  if (tsType === "boolean") return "boolean"
  if (tsType === "number") return "number"
  if (tsType === "string" || field.type.isEnum || field.type.isOverridden) return "string"
  if (
    field.type.typeNames.length <= 2 &&
    field.type.typeNames.every((n) => n === "string" || n === "number")
  )
    return "string"
  return "json"
}

const inputStyle =
  "width:100%;padding:6px 8px;border:1px solid var(--sl-color-gray-5);border-radius:4px;font-size:13px;font-family:var(--sl-font-mono);background:var(--sl-color-bg);color:var(--sl-color-text);"

const labelStyle =
  "display:block;font-size:12px;font-weight:500;margin-bottom:2px;color:var(--sl-color-gray-2);"

const btnPrimary =
  "padding:6px 16px;background:var(--sl-color-text-accent);color:white;border:none;border-radius:4px;font-size:13px;cursor:pointer;"

const btnSecondary =
  "padding:6px 16px;background:transparent;color:var(--sl-color-gray-2);border:1px solid var(--sl-color-gray-5);border-radius:4px;font-size:13px;cursor:pointer;"

const makeFieldInput = (field: EntityField): string[] => {
  const inputType = resolveInputType(field)
  const label = `<label style="${labelStyle}">${field.name}</label>`

  if (inputType === "boolean") {
    return [
      `<div style="margin-bottom:8px;">`,
      label,
      `<select x-model="values.${field.name}" style="${inputStyle}">`,
      `<option value="">—</option>`,
      `<option value="true">true</option>`,
      `<option value="false">false</option>`,
      `</select>`,
      `</div>`
    ]
  }

  if (inputType === "json") {
    return [
      `<div style="margin-bottom:8px;">`,
      label,
      `<textarea x-model="values.${field.name}" placeholder='{}' rows="2" style="${inputStyle}resize:vertical;"></textarea>`,
      `</div>`
    ]
  }

  if (field.name === "chat_id") {
    return [
      `<div style="margin-bottom:8px;">`,
      label,
      `<div style="display:flex;gap:8px;">`,
      `<input type="text" x-model="values.chat_id" placeholder="chat_id" style="flex:1;${inputStyle}">`,
      `<button @click="detectChatId()" :disabled="detectingChatId || !token" style="${btnSecondary}font-size:12px;">`,
      `<span x-show="!detectingChatId">Detect</span>`,
      `<span x-show="detectingChatId">...</span>`,
      `</button>`,
      `</div>`,
      `</div>`
    ]
  }

  const htmlType = inputType === "number" ? "number" : "text"
  return [
    `<div style="margin-bottom:8px;">`,
    label,
    `<input type="${htmlType}" x-model="values.${field.name}" placeholder="${field.name}" style="${inputStyle}">`,
    `</div>`
  ]
}

const makeApiRunnerBlock = (method: ExtractedMethodShape): string[] => {
  const fields = method.parameters?.fields ?? []

  const fieldsJson = JSON.stringify(
    fields.map((f) => ({
      name: f.name,
      type: resolveInputType(f),
      required: f.required
    }))
  ).replaceAll('"', "'")

  const config = `{method:'${method.methodName}',fields:${fieldsJson}}`

  const required = fields.filter((f) => f.required)
  const optional = fields.filter((f) => !f.required)

  const lines: string[] = [
    `<div class="not-content" x-data="apiRunner(${config})">`,
    `<div style="margin-top:1.5rem;border:1px solid var(--sl-color-gray-5);border-radius:8px;overflow:hidden;">`,

    // Token status
    `<div x-show="token" x-cloak style="padding:8px 14px;background:var(--sl-color-gray-6);border-bottom:1px solid var(--sl-color-gray-5);display:flex;align-items:center;justify-content:flex-end;">`,
    `<span style="font-size:12px;color:var(--sl-color-gray-3);">`,
    `Token saved`,
    `<button @click="clearToken()" style="margin-left:6px;color:var(--sl-color-text-accent);cursor:pointer;background:none;border:none;font-size:12px;">Change</button>`,
    `</span>`,
    `</div>`,

    // Body
    `<div style="padding:14px;">`,

    // Token input
    `<div x-show="showTokenInput" style="margin-bottom:12px;">`,
    `<label style="${labelStyle}">Bot Token</label>`,
    `<div style="display:flex;gap:8px;">`,
    `<input x-model="tokenInput" type="text" placeholder="Paste token from @BotFather" style="flex:1;${inputStyle}">`,
    `<button @click="saveToken()" style="${btnPrimary}">Save</button>`,
    `</div>`,
    `</div>`
  ]

  // Required fields
  for (const field of required) {
    lines.push(...makeFieldInput(field))
  }

  // Optional fields toggle
  if (optional.length > 0) {
    lines.push(
      `<button @click="showOptional = !showOptional" style="background:none;border:none;color:var(--sl-color-text-accent);font-size:12px;cursor:pointer;padding:4px 0;margin-bottom:8px;">`,
      `<span x-text="showOptional ? 'Hide' : 'Show'"></span> optional (${optional.length})`,
      `</button>`,
      `<div x-show="showOptional" x-transition x-cloak>`
    )
    for (const field of optional) {
      lines.push(...makeFieldInput(field))
    }
    lines.push(`</div>`)
  }

  // Actions
  lines.push(
    `<div x-show="token" x-cloak style="display:flex;gap:8px;margin-top:12px;">`,
    `<button @click="run()" :disabled="loading" style="${btnPrimary}">`,
    `<span x-show="!loading">Run</span>`,
    `<span x-show="loading">Running...</span>`,
    `</button>`,
    ...(fields.length > 0
      ? [`<button @click="reset()" style="${btnSecondary}">Reset</button>`]
      : []),
    `</div>`,

    // Response
    `<div x-show="response !== null || error !== null" x-transition x-cloak style="margin-top:12px;">`,
    `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">`,
    `<span style="font-size:12px;font-weight:600;" :style="responseOk === true ? 'color:#22c55e' : 'color:#ef4444'">Response</span>`,
    `<button @click="showResponse = !showResponse" style="font-size:11px;cursor:pointer;background:none;border:none;color:var(--sl-color-gray-3);" x-text="showResponse ? 'Collapse' : 'Expand'"></button>`,
    `</div>`,
    `<pre x-show="showResponse" x-text="error ?? response" style="overflow:auto;max-height:400px;padding:10px;border:1px solid;border-radius:4px;font-size:12px;line-height:1.5;background:var(--sl-color-gray-7);white-space:pre-wrap;margin:0;" :style="responseOk === false || error ? 'border-color:#ef4444' : 'border-color:#22c55e'"></pre>`,
    `</div>`,

    // Close body, card, wrapper
    `</div>`,
    `</div>`,
    `</div>`,
    ""
  )

  return lines
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

const makeTypeMetaDescription = (extracted: ExtractedTypeShape): string => {
  const desc = extracted.description.map(removeHtmlTags).join(" ").replace(/\.+$/, "")

  let meta = `${extracted.typeName} – Telegram Bot API type. ${desc}.`

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
  /(\d[\d,]*[\-–]\d[\d,]*\s+characters)/i,
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
  const match = name.match(/^(send|get|set|delete|edit|create|answer|ban|unban|pin|unpin|forward|copy|upload|add|remove|close|reopen|hide|unhide|export|revoke|restrict|promote|approve|decline|stop|leave|verify|transfer|upgrade|convert|read|post|repost)/)
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
  const desc = extracted.description.map(removeHtmlTags).join(" ")
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

const makeMethodPage = (
  method: ExtractedMethodShape,
  groupMap: MethodGroupMap
): string => {
  const description = joinSentences(method.methodDescription)
  const metaDescription = makeMethodMetaDescription(method)
  const tgLink = `[↗](https://core.telegram.org/bots/api#${method.methodName.toLowerCase()})`
  const lines: string[] = [
    "---",
    `title: "${escapeYaml(method.methodName)} – Telegram Bot API"`,
    `description: "${escapeYaml(metaDescription)}"`,
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
    for (const name of type.typeNames) {
      const baseName = name.replace(/\[\]+$/, "")
      if (isComplexType(baseName)) addUsage(baseName, method)
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

const makeTypePage = (
  extracted: ExtractedTypeShape,
  usageMap: TypeUsageMap
): string => {
  const description = joinSentences(extracted.description)
  const metaDescription = makeTypeMetaDescription(extracted)
  const tgLink = `[↗](https://core.telegram.org/bots/api#${extracted.typeName.toLowerCase()})`
  const lines: string[] = [
    "---",
    `title: "${escapeYaml(extracted.typeName)} – Telegram Bot API Type"`,
    `description: "${escapeYaml(metaDescription)}"`,
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
        lines.push(
          `- [${method.methodName}](/api/methods/${toKebab(method.methodName)}/)`
        )
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
    const typeNames = extracted.type.typeNames
    if (typeNames.length > 1) {
      lines.push("## Variants", "")
      for (const name of typeNames) {
        lines.push(`- ${linkSingleType(name)}`)
      }
      lines.push("")
    }

    // Used by methods (for union types too)
    const usedBy = usageMap.get(extracted.typeName)
    if (usedBy && usedBy.length > 0) {
      lines.push("## Used by", "")
      for (const method of usedBy) {
        lines.push(
          `- [${method.methodName}](/api/methods/${toKebab(method.methodName)}/)`
        )
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
  const sorted = [...input.methods].sort((a, b) =>
    a.methodName.localeCompare(b.methodName)
  )

  const links = sorted
    .map(m => `[${m.methodName}](/api/methods/${toKebab(m.methodName)}/)`)
    .join(" · ")

  const lines: string[] = [
    "---",
    `title: "Methods"`,
    `description: "Telegram Bot API ${input.apiVersion} — ${input.methods.length} methods"`,
    `tableOfContents: false`,
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

const makeTypesIndex = (input: {
  apiVersion: string
  types: ExtractedTypeShape[]
}): string => {
  const sorted = [...input.types].sort((a, b) =>
    a.typeName.localeCompare(b.typeName)
  )

  const links = sorted
    .map(t => `[${t.typeName}](/api/types/${toKebab(t.typeName)}/)`)
    .join(" · ")

  const lines: string[] = [
    "---",
    `title: "Types"`,
    `description: "Telegram Bot API ${input.apiVersion} — ${input.types.length} types"`,
    `tableOfContents: false`,
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

          const groupMap = buildMethodGroupMap(input.methods)

          yield* Effect.forEach(
            input.methods,
            (method) => {
              const fileName = `${toKebab(method.methodName)}.md`
              const content = makeMethodPage(method, groupMap)
              return Effect.tryPromise(() =>
                writeFile(Path.join(methodsDir, fileName), content)
              )
            },
            { concurrency: "unbounded" }
          )

          const usageMap = buildTypeUsageMap(input.methods)

          yield* Effect.forEach(
            input.types,
            (type) => {
              const fileName = `${toKebab(type.typeName)}.md`
              const content = makeTypePage(type, usageMap)
              return Effect.tryPromise(() =>
                writeFile(Path.join(typesDir, fileName), content)
              )
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
