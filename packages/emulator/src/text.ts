/**
 * @module text
 * Outgoing-text helpers: command entity detection and parse mode handling.
 */
import type { MessageEntity } from "@effect-ak/tg-bot-api"

import { parseHtmlText } from "./html"

export const commandEntities = (text: string): MessageEntity[] | undefined => {
  if (!text.startsWith("/")) return undefined
  const spaceAt = text.search(/\s/)
  return [
    {
      type: "bot_command",
      offset: 0,
      length: spaceAt === -1 ? text.length : spaceAt
    }
  ]
}

/**
 * What the Bot API does to outgoing text: HTML parse mode strips tags
 * into entities; otherwise the text is taken verbatim (a leading `/`
 * still becomes a `bot_command` entity, like Telegram does).
 */
export const parseOutgoingText = (
  text: string,
  parse_mode?: string
): { text: string; entities?: MessageEntity[] } => {
  if (parse_mode === "HTML") {
    const parsed = parseHtmlText(text)
    return { text: parsed.text, ...(parsed.entities.length ? { entities: parsed.entities } : {}) }
  }
  const entities = commandEntities(text)
  return { text, ...(entities ? { entities } : {}) }
}
