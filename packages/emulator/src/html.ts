/**
 * @module html
 * Minimal HTML parse mode support, mirroring what the Bot API does to
 * `parse_mode: "HTML"` messages: tags are stripped from the text and
 * become {@link MessageEntity} ranges (offsets in UTF-16 code units).
 * Unknown tags are kept as literal text instead of failing the request.
 */
import type { MessageEntity } from "@effect-ak/tg-bot-api"

export interface ParsedText {
  text: string
  entities: MessageEntity[]
}

const TAG_TO_TYPE: Record<string, MessageEntity["type"]> = {
  b: "bold",
  strong: "bold",
  i: "italic",
  em: "italic",
  u: "underline",
  ins: "underline",
  s: "strikethrough",
  strike: "strikethrough",
  del: "strikethrough",
  code: "code",
  pre: "pre",
  a: "text_link",
  "tg-spoiler": "spoiler",
  blockquote: "blockquote"
}

const HTML_ENTITIES: Record<string, string> = {
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'"
}

const decodeHtmlEntities = (input: string): string =>
  input.replace(/&(?:lt|gt|amp|quot|#39);/g, (m) => HTML_ENTITIES[m] ?? m)

const attrValue = (attrs: string, name: string): string | undefined =>
  new RegExp(`${name}\\s*=\\s*"([^"]*)"`).exec(attrs)?.[1]

interface OpenTag {
  type: MessageEntity["type"]
  offset: number
  url?: string
  language?: string
}

/** Strip supported HTML tags from `input` into text + entities. */
export const parseHtmlText = (input: string): ParsedText => {
  const tagRe = /<(\/?)([a-zA-Z-]+)((?:\s+[a-zA-Z-]+(?:\s*=\s*"[^"]*")?)*)\s*\/?>/g
  const entities: MessageEntity[] = []
  const stack: OpenTag[] = []
  let text = ""
  let last = 0
  let match: RegExpExecArray | null

  while ((match = tagRe.exec(input))) {
    text += decodeHtmlEntities(input.slice(last, match.index))
    last = tagRe.lastIndex

    const [literal, closing, rawTag, attrs] = match
    const tag = rawTag.toLowerCase()
    const type = TAG_TO_TYPE[tag]
    if (!type) {
      text += literal
      continue
    }

    if (!closing) {
      const open: OpenTag = { type, offset: text.length }
      if (tag === "a") {
        const href = attrValue(attrs, "href")
        if (href) open.url = href
      }
      if (tag === "pre") {
        const language = attrValue(attrs, "language")
        if (language) open.language = language
      }
      // `<pre><code class="language-x">` is Telegram's spelling for a
      // fenced code block — fold the language into the enclosing pre.
      if (tag === "code") {
        const cls = attrValue(attrs, "class")
        const enclosing = stack.find((t) => t.type === "pre" && !t.language)
        if (cls?.startsWith("language-") && enclosing) {
          enclosing.language = cls.slice("language-".length)
        }
      }
      stack.push(open)
    } else {
      const index = stack.map((t) => t.type).lastIndexOf(type)
      if (index === -1) continue
      const [open] = stack.splice(index, 1)
      const length = text.length - open.offset
      if (length > 0) {
        entities.push({
          type: open.type,
          offset: open.offset,
          length,
          ...(open.url ? { url: open.url } : {}),
          ...(open.language ? { language: open.language } : {})
        })
      }
    }
  }

  text += decodeHtmlEntities(input.slice(last))
  entities.sort((a, b) => a.offset - b.offset || b.length - a.length)
  return { text, entities }
}
