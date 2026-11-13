/**
 * @module render-text
 * A message's text with its entities, the media label, the reply quote.
 * Entities that overlap an earlier one are dropped: the outermost range wins.
 */
import type { Message, MessageEntity } from "@effect-ak/tg-bot-api"
import type { ReactNode } from "react"

/** What tapping inside a message does: a command, a callback button, a copy button. */
export interface RenderHandlers {
  command(text: string): void
  callback(data: string): void
  copy(text: string): void
}

const wrapEntity = (
  entity: MessageEntity,
  inner: string,
  key: number,
  handlers: RenderHandlers
): ReactNode => {
  switch (entity.type) {
    case "bold":
      return <strong key={key}>{inner}</strong>
    case "italic":
      return <em key={key}>{inner}</em>
    case "underline":
      return <u key={key}>{inner}</u>
    case "strikethrough":
      return <s key={key}>{inner}</s>
    case "code":
      return (
        <code key={key} className="tgc-code">
          {inner}
        </code>
      )
    case "pre":
      return (
        <pre key={key} className="tgc-pre">
          {inner}
        </pre>
      )
    case "text_link":
    case "url":
      return (
        <a
          key={key}
          href={entity.type === "text_link" ? entity.url : inner}
          target="_blank"
          rel="noopener"
          className="tgc-link"
        >
          {inner}
        </a>
      )
    case "bot_command":
      return (
        <button
          key={key}
          type="button"
          className="tgc-command"
          data-command={inner}
          onClick={() => handlers.command(inner)}
        >
          {inner}
        </button>
      )
    case "spoiler":
      return (
        <span key={key} className="tgc-spoiler">
          {inner}
        </span>
      )
    case "blockquote":
    case "expandable_blockquote":
      return (
        <span key={key} className="tgc-quote">
          {inner}
        </span>
      )
    default:
      return inner
  }
}

export const renderEntities = (
  text: string,
  entities: readonly MessageEntity[],
  handlers: RenderHandlers
): ReactNode[] => {
  const sorted = [...entities].sort((a, b) => a.offset - b.offset || b.length - a.length)
  const nodes: ReactNode[] = []
  let cursor = 0
  for (const [index, entity] of sorted.entries()) {
    if (entity.offset < cursor) continue
    if (entity.offset > cursor) nodes.push(text.slice(cursor, entity.offset))
    const inner = text.slice(entity.offset, entity.offset + entity.length)
    nodes.push(wrapEntity(entity, inner, index, handlers))
    cursor = entity.offset + entity.length
  }
  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}

/** A short label for an attachment the chat does not display. */
export const describeMedia = (message: Message): string | undefined => {
  if (message.photo) return "🖼 photo"
  if (message.document) return `📎 ${message.document.file_name ?? "document"}`
  if (message.sticker) return "🩵 sticker"
  if (message.video) return "🎬 video"
  if (message.audio) return "🎵 audio"
  if (message.voice) return "🎤 voice"
  if (message.animation) return "🎞 animation"
  if (message.dice) return `${message.dice.emoji} ${message.dice.value}`
  if (message.location) {
    return `📍 ${message.location.latitude.toFixed(4)}, ${message.location.longitude.toFixed(4)}`
  }
  if (message.contact) return `👤 ${message.contact.first_name} ${message.contact.phone_number}`
  return undefined
}

export const textOf = (message: Message): string | undefined => message.text ?? message.caption

/** The quoted message at the top of a reply. */
export const ReplyQuote = ({ message }: { message: Message }) => {
  const replied = message.reply_to_message
  if (!replied) return null
  const raw = textOf(replied) ?? "…"
  return (
    <span className="tgc-reply">
      <span className="tgc-reply-name">{replied.from?.is_bot ? "Bot" : "You"}</span>
      {raw.length > 70 ? `${raw.slice(0, 70)}…` : raw}
    </span>
  )
}
