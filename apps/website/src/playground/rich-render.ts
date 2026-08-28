/**
 * Renders RichMessage blocks (Bot API 10.1+) to sanitized HTML for the
 * virtual chat. RichText is recursive: a string, an array, or a typed
 * span node. Buttons with callback_data get `data-callback` attributes;
 * the bubble's click handler dispatches the tap.
 */
import type { RichMessage } from "@effect-ak/tg-bot-api"

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)

type AnyNode = Record<string, any>

export function renderRichText(node: unknown): string {
  if (node == null) return ""
  if (typeof node === "string") return escapeHtml(node)
  if (Array.isArray(node)) return node.map(renderRichText).join("")
  const span = node as AnyNode
  const inner = renderRichText(span["text"])
  switch (span["type"]) {
    case "bold":
      return `<strong>${inner}</strong>`
    case "italic":
      return `<em>${inner}</em>`
    case "underline":
      return `<u>${inner}</u>`
    case "strikethrough":
      return `<s>${inner}</s>`
    case "spoiler":
      return `<span class="msg-spoiler">${inner}</span>`
    case "code":
      return `<code class="msg-code">${inner}</code>`
    case "marked":
      return `<mark>${inner}</mark>`
    case "subscript":
      return `<sub>${inner}</sub>`
    case "superscript":
      return `<sup>${inner}</sup>`
    case "url":
    case "email_address":
    case "phone_number": {
      const href =
        span["type"] === "email_address"
          ? `mailto:${span["email_address"] ?? ""}`
          : span["type"] === "phone_number"
            ? `tel:${span["phone_number"] ?? ""}`
            : (span["url"] ?? "")
      return `<a href="${escapeHtml(String(href))}" target="_blank" rel="noopener" class="msg-link">${inner}</a>`
    }
    case "bot_command":
      return `<button type="button" class="msg-command" data-command="${inner}">${inner}</button>`
    case "date_time":
      return `<span class="msg-datetime">${inner}</span>`
    case "button":
      // RichTextButton: a button inline in the text (Bot API 10.1)
      return renderRichButton(span["button"] ?? {})
    default:
      return inner
  }
}

const BUTTON_STYLE_CLASSES: Record<string, string> = {
  primary: "rich-btn-primary",
  success: "rich-btn-success",
  danger: "rich-btn-danger",
  link: "rich-btn-link"
}

const renderRichButton = (button: AnyNode): string => {
  const label = renderRichText(button["text"])
  const styleClass = BUTTON_STYLE_CLASSES[button["style"] as string] ?? ""
  if (button["url"]) {
    return `<a href="${escapeHtml(String(button["url"]))}" target="_blank" rel="noopener" class="rich-btn ${styleClass}">${label}</a>`
  }
  if (button["callback_data"]) {
    return `<button type="button" class="rich-btn ${styleClass}" data-callback="${escapeHtml(String(button["callback_data"]))}">${label}</button>`
  }
  if (button["copy_text"]) {
    const copy = escapeHtml(String(button["copy_text"]["text"] ?? ""))
    return `<button type="button" class="rich-btn ${styleClass}" data-copy="${copy}">${label}</button>`
  }
  return `<button type="button" class="rich-btn ${styleClass}" disabled>${label}</button>`
}

const renderButtons = (block: AnyNode): string => {
  const buttons = (block["buttons"] as AnyNode[] | undefined) ?? []
  const rendered = buttons.map(renderRichButton).join("")
  const align =
    block["align"] === "center" ? "center" : block["align"] === "right" ? "flex-end" : "flex-start"
  return `<div class="rich-btn-row" style="justify-content:${align}">${rendered}</div>`
}

const renderListItem = (item: AnyNode): string => {
  const checkbox = item["has_checkbox"]
    ? `<span class="rich-checkbox">${item["is_checked"] ? "☑" : "☐"}</span> `
    : ""
  return `<li>${checkbox}${renderRichBlocksHtml(item["blocks"] ?? [])}</li>`
}

const renderTable = (block: AnyNode): string => {
  const rows = ((block["cells"] as AnyNode[][] | undefined) ?? [])
    .map((row) => {
      const cells = row
        .map((cell) => {
          const tag = cell["is_header"] ? "th" : "td"
          const span =
            (cell["colspan"] ? ` colspan="${Number(cell["colspan"])}"` : "") +
            (cell["rowspan"] ? ` rowspan="${Number(cell["rowspan"])}"` : "")
          return `<${tag}${span} style="text-align:${cell["align"] ?? "left"}">${renderRichText(cell["text"])}</${tag}>`
        })
        .join("")
      return `<tr>${cells}</tr>`
    })
    .join("")
  const caption = block["caption"]
    ? `<caption class="rich-table-caption">${renderRichText(block["caption"])}</caption>`
    : ""
  return `<div class="rich-table-wrap"><table class="rich-table">${caption}${rows}</table></div>`
}

const renderBlock = (block: AnyNode): string => {
  switch (block["type"]) {
    case "paragraph":
      return `<p class="rich-p">${renderRichText(block["text"])}</p>`
    case "heading": {
      const size = Math.min(Math.max(Number(block["size"]) || 1, 1), 3)
      return `<p class="rich-h rich-h${size}">${renderRichText(block["text"])}</p>`
    }
    case "pre": {
      const language = block["language"]
        ? `<span class="rich-pre-lang">${escapeHtml(String(block["language"]))}</span>`
        : ""
      return `<pre class="msg-pre">${language}${renderRichText(block["text"])}</pre>`
    }
    case "footer":
      return `<p class="rich-footer">${renderRichText(block["text"])}</p>`
    case "divider":
      return `<hr class="rich-divider" />`
    case "blockquote":
      return `<div class="msg-quote">${renderRichBlocksHtml(block["blocks"] ?? [])}${
        block["credit"] ? `<div class="rich-credit">${renderRichText(block["credit"])}</div>` : ""
      }</div>`
    case "expandable_blockquote":
    case "pullquote":
      return `<div class="msg-quote">${renderRichText(block["text"])}${
        block["credit"] ? `<div class="rich-credit">${renderRichText(block["credit"])}</div>` : ""
      }</div>`
    case "list": {
      const items = ((block["items"] as AnyNode[] | undefined) ?? []).map(renderListItem).join("")
      const ordered = (block["items"] as AnyNode[] | undefined)?.some(
        (i) => i["value"] !== undefined || i["type"]
      )
      return ordered ? `<ol class="rich-list">${items}</ol>` : `<ul class="rich-list">${items}</ul>`
    }
    case "details":
      return `<details class="rich-details"${block["is_open"] ? " open" : ""}><summary>${renderRichText(
        block["summary"]
      )}</summary>${renderRichBlocksHtml(block["blocks"] ?? [])}</details>`
    case "table":
      return renderTable(block)
    case "buttons":
      return renderButtons(block)
    case "thinking":
      return `<p class="rich-thinking">${renderRichText(block["text"]) || "Thinking…"}</p>`
    default:
      // media blocks (photo, video, collage, map, …) are not rendered yet
      return `<p class="rich-unsupported">[${escapeHtml(String(block["type"] ?? "block"))}]</p>`
  }
}

export function renderRichBlocksHtml(blocks: readonly unknown[]): string {
  return blocks.map((b) => renderBlock(b as AnyNode)).join("")
}

export function renderRichMessageHtml(rich: RichMessage): string {
  return `<div class="rich-body"${rich.is_rtl ? ' dir="rtl"' : ""}>${renderRichBlocksHtml(rich.blocks)}</div>`
}
