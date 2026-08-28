/**
 * @module rich
 * Rich message support (Bot API 10.1+): resolves an outgoing
 * `InputRichMessage` into the `RichMessage` the API would return.
 * `blocks` pass through as-is; `html` is converted with the same HTML
 * parser used for `parse_mode: "HTML"` — inline tags become RichText
 * spans, `<pre>` and `<blockquote>` become their own blocks.
 */
import type {
  InputRichMessage,
  MessageEntity,
  RichBlock,
  RichMessage,
  RichText
} from "@effect-ak/tg-bot-api"

import { parseHtmlText } from "./html"

/** @deprecated The generated `RichText` now includes the string/array leaves — use it directly. */
export type RichTextNode = RichText

/** Thrown when the input cannot be resolved; mapped to a 400 response. */
export class RichInputError extends Error {}

type InlineRichType =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "spoiler"
  | "code"
  | "url"
  | "bot_command"

const INLINE_ENTITY_TO_RICH: Partial<Record<MessageEntity["type"], InlineRichType>> = {
  bold: "bold",
  italic: "italic",
  underline: "underline",
  strikethrough: "strikethrough",
  spoiler: "spoiler",
  code: "code",
  text_link: "url",
  url: "url",
  bot_command: "bot_command"
}

const isBlockLevel = (entity: MessageEntity): boolean =>
  entity.type === "pre" || entity.type === "blockquote"

const containedIn = (inner: MessageEntity, outer: MessageEntity): boolean =>
  inner !== outer &&
  inner.offset >= outer.offset &&
  inner.offset + inner.length <= outer.offset + outer.length

/** Entities of `all` that lie in [start, end) and are not nested in another one there. */
const topLevelWithin = (all: MessageEntity[], start: number, end: number): MessageEntity[] => {
  const inRange = all.filter((e) => e.offset >= start && e.offset + e.length <= end)
  return inRange
    .filter((e) => !inRange.some((outer) => containedIn(e, outer)))
    .sort((a, b) => a.offset - b.offset)
}

const richNode = (
  text: string,
  entities: MessageEntity[],
  start: number,
  end: number
): RichTextNode => {
  const parts: RichTextNode[] = []
  let cursor = start
  for (const entity of topLevelWithin(entities, start, end)) {
    if (entity.offset > cursor) parts.push(text.slice(cursor, entity.offset))
    // Exclude the entity itself when descending, or one spanning the whole
    // range would recurse into itself forever
    const inner = richNode(
      text,
      entities.filter((e) => e !== entity),
      entity.offset,
      entity.offset + entity.length
    )
    const type = INLINE_ENTITY_TO_RICH[entity.type]
    if (!type) {
      parts.push(inner)
    } else if (type === "url") {
      parts.push({
        type: "url",
        text: inner,
        url: entity.url ?? text.slice(entity.offset, entity.offset + entity.length)
      })
    } else {
      // {type: A|B, …} does not distribute over the union — safe per-literal
      parts.push({ type, text: inner } as RichText)
    }
    cursor = entity.offset + entity.length
  }
  if (cursor < end) parts.push(text.slice(cursor, end))
  return parts.length === 1 ? parts[0] : parts
}

/** Convert HTML (the `html` field of InputRichMessage) into rich blocks. */
export const htmlToRichBlocks = (html: string): RichBlock[] => {
  const { text, entities } = parseHtmlText(html)
  const blockEntities = entities.filter(isBlockLevel).sort((a, b) => a.offset - b.offset)
  const inline = entities.filter((e) => !isBlockLevel(e))
  const blocks: RichBlock[] = []

  const pushParagraphs = (start: number, end: number) => {
    const slice = text.slice(start, end).trim()
    if (!slice) return
    // Re-trim offsets so leading whitespace does not shift entities
    const from = start + text.slice(start, end).indexOf(slice)
    blocks.push({
      type: "paragraph",
      text: richNode(text, inline, from, from + slice.length) as RichText
    })
  }

  let cursor = 0
  for (const block of blockEntities) {
    pushParagraphs(cursor, block.offset)
    const inner = richNode(text, inline, block.offset, block.offset + block.length)
    if (block.type === "pre") {
      blocks.push({
        type: "pre",
        text: inner as RichText,
        ...(block.language ? { language: block.language } : {})
      })
    } else {
      blocks.push({
        type: "blockquote",
        blocks: [{ type: "paragraph", text: inner as RichText }]
      })
    }
    cursor = block.offset + block.length
  }
  pushParagraphs(cursor, text.length)
  return blocks
}

/** What the API does to an outgoing rich message. */
export const resolveInputRichMessage = (input: InputRichMessage): RichMessage => {
  if (input.blocks) {
    // Input blocks are structurally the resolved blocks for everything the
    // emulator cares about — media resolution is out of scope.
    return {
      blocks: input.blocks as unknown as RichBlock[],
      ...(input.is_rtl ? { is_rtl: input.is_rtl } : {})
    }
  }
  if (input.html !== undefined) {
    return {
      blocks: htmlToRichBlocks(input.html),
      ...(input.is_rtl ? { is_rtl: input.is_rtl } : {})
    }
  }
  if (input.markdown !== undefined) {
    throw new RichInputError("markdown input is not supported by the emulator — use html or blocks")
  }
  throw new RichInputError("rich_message must specify blocks, html, or markdown")
}
