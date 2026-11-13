/**
 * @module render-rich
 * Rich messages (Bot API 10.1+) as React elements: blocks, the recursive
 * RichText inside them, and buttons. Media blocks are named, not shown.
 */
import type {
  RichBlock,
  RichBlockListItem,
  RichBlockTable,
  RichMessage,
  RichMessageButton,
  RichText
} from "@effect-ak/tg-bot-api"
import { Fragment, type ReactNode } from "react"

import type { RenderHandlers } from "./render-text"

const link = (href: string, inner: ReactNode) => (
  <a href={href} target="_blank" rel="noopener" className="tgc-link">
    {inner}
  </a>
)

export const renderRichText = (text: RichText | undefined, h: RenderHandlers): ReactNode => {
  if (text === undefined) return null
  if (typeof text === "string") return text
  if (Array.isArray(text)) {
    return text.map((part, i) => <Fragment key={i}>{renderRichText(part, h)}</Fragment>)
  }
  switch (text.type) {
    case "bold":
      return <strong>{renderRichText(text.text, h)}</strong>
    case "italic":
      return <em>{renderRichText(text.text, h)}</em>
    case "underline":
      return <u>{renderRichText(text.text, h)}</u>
    case "strikethrough":
      return <s>{renderRichText(text.text, h)}</s>
    case "spoiler":
      return <span className="tgc-spoiler">{renderRichText(text.text, h)}</span>
    case "code":
      return <code className="tgc-code">{renderRichText(text.text, h)}</code>
    case "marked":
      return <mark>{renderRichText(text.text, h)}</mark>
    case "subscript":
      return <sub>{renderRichText(text.text, h)}</sub>
    case "superscript":
      return <sup>{renderRichText(text.text, h)}</sup>
    case "url":
      return link(text.url, renderRichText(text.text, h))
    case "email_address":
      return link(`mailto:${text.email_address}`, renderRichText(text.text, h))
    case "phone_number":
      return link(`tel:${text.phone_number}`, renderRichText(text.text, h))
    case "bot_command":
      return (
        <button
          type="button"
          className="tgc-command"
          data-command={text.bot_command}
          onClick={() => h.command(text.bot_command)}
        >
          {renderRichText(text.text, h)}
        </button>
      )
    case "date_time":
      return <span className="tgc-datetime">{renderRichText(text.text, h)}</span>
    case "button":
      return <RichButton button={text.button} h={h} />
    case "custom_emoji":
      return text.alternative_text
    case "mathematical_expression":
      return <code className="tgc-code">{text.expression}</code>
    case "anchor":
      return null
    case "mention":
    case "hashtag":
    case "cashtag":
      return <span className="tgc-entity">{renderRichText(text.text, h)}</span>
    default:
      // text_mention, references, anchors links, card numbers, TON addresses
      return renderRichText(text.text, h)
  }
}

const RichButton = ({ button, h }: { button: RichMessageButton; h: RenderHandlers }) => {
  const className = `tgc-rich-btn${button.style ? ` tgc-rich-btn-${button.style}` : ""}`
  const label = renderRichText(button.text, h)
  if (button.url) {
    return (
      <a href={button.url} target="_blank" rel="noopener" className={className}>
        {label}
      </a>
    )
  }
  const { callback_data, copy_text } = button
  if (callback_data) {
    return (
      <button
        type="button"
        className={className}
        data-callback={callback_data}
        onClick={() => h.callback(callback_data)}
      >
        {label}
      </button>
    )
  }
  if (copy_text) {
    return (
      <button
        type="button"
        className={className}
        data-copy={copy_text.text}
        onClick={() => h.copy(copy_text.text)}
      >
        {label}
      </button>
    )
  }
  return (
    <button type="button" className={className} disabled>
      {label}
    </button>
  )
}

const ListItem = ({ item, h }: { item: RichBlockListItem; h: RenderHandlers }) => (
  <li>
    {item.has_checkbox && (
      <span className="tgc-rich-checkbox">{item.is_checked ? "☑ " : "☐ "}</span>
    )}
    {renderRichBlocks(item.blocks, h)}
  </li>
)

const Table = ({ block, h }: { block: RichBlockTable; h: RenderHandlers }) => (
  <div className="tgc-rich-table-wrap">
    <table className="tgc-rich-table">
      {block.caption !== undefined && (
        <caption className="tgc-rich-table-caption">{renderRichText(block.caption, h)}</caption>
      )}
      <tbody>
        {block.cells.map((row, r) => (
          <tr key={r}>
            {row.map((cell, c) => {
              const Cell = cell.is_header ? "th" : "td"
              return (
                <Cell
                  key={c}
                  colSpan={cell.colspan}
                  rowSpan={cell.rowspan}
                  style={{ textAlign: cell.align }}
                >
                  {renderRichText(cell.text, h)}
                </Cell>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const credit = (text: RichText | undefined, h: RenderHandlers) =>
  text !== undefined && <div className="tgc-rich-credit">{renderRichText(text, h)}</div>

const justify: Record<"left" | "center" | "right", string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end"
}

const renderBlock = (block: RichBlock, h: RenderHandlers): ReactNode => {
  switch (block.type) {
    case "paragraph":
      return <p className="tgc-rich-p">{renderRichText(block.text, h)}</p>
    case "heading": {
      const size = Math.min(Math.max(block.size || 1, 1), 3)
      return <p className={`tgc-rich-h tgc-rich-h${size}`}>{renderRichText(block.text, h)}</p>
    }
    case "pre":
      return (
        <pre className="tgc-pre">
          {block.language && <span className="tgc-rich-pre-lang">{block.language}</span>}
          {renderRichText(block.text, h)}
        </pre>
      )
    case "footer":
      return <p className="tgc-rich-footer">{renderRichText(block.text, h)}</p>
    case "divider":
      return <hr className="tgc-rich-divider" />
    case "blockquote":
      return (
        <div className="tgc-quote">
          {renderRichBlocks(block.blocks, h)}
          {credit(block.credit, h)}
        </div>
      )
    case "expandable_blockquote":
    case "pullquote":
      return (
        <div className="tgc-quote">
          {renderRichText(block.text, h)}
          {credit(block.credit, h)}
        </div>
      )
    case "list": {
      const items = block.items.map((item, i) => <ListItem key={i} item={item} h={h} />)
      const ordered = block.items.some((i) => i.value !== undefined || i.type !== undefined)
      return ordered ? (
        <ol className="tgc-rich-list">{items}</ol>
      ) : (
        <ul className="tgc-rich-list">{items}</ul>
      )
    }
    case "details":
      return (
        <details className="tgc-rich-details" open={block.is_open}>
          <summary>{renderRichText(block.summary, h)}</summary>
          {renderRichBlocks(block.blocks, h)}
        </details>
      )
    case "table":
      return <Table block={block} h={h} />
    case "buttons":
      return (
        <div
          className="tgc-rich-btn-row"
          style={{ justifyContent: justify[block.align ?? "left"] }}
        >
          {block.buttons.map((button, i) => (
            <RichButton key={i} button={button} h={h} />
          ))}
        </div>
      )
    case "thinking":
      return <p className="tgc-thinking">{renderRichText(block.text, h) || "Thinking…"}</p>
    default:
      // Media blocks (photo, video, collage, map, …) are named, not shown
      return <p className="tgc-rich-unsupported">[{block.type}]</p>
  }
}

export const renderRichBlocks = (blocks: readonly RichBlock[], h: RenderHandlers): ReactNode =>
  blocks.map((block, i) => <Fragment key={i}>{renderBlock(block, h)}</Fragment>)

export const RichMessageView = ({ rich, h }: { rich: RichMessage; h: RenderHandlers }) => (
  <div className="tgc-rich" dir={rich.is_rtl ? "rtl" : undefined}>
    {renderRichBlocks(rich.blocks, h)}
  </div>
)
