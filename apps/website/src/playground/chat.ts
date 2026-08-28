/**
 * Virtual chat slice of the playground component: mirrors the emulator's
 * chat state from worker events and sends user actions back.
 */
import type { InlineKeyboardButton, Message, MessageEntity } from "@effect-ak/tg-bot-api"
import type { EmulatorDraft, EmulatorEvent } from "@effect-ak/tg-bot-emulator"

import { renderRichMessageHtml } from "./rich-render"

// How long a `send_chat_action` keeps the typing indicator on (Telegram: ~5s)
const CHAT_ACTION_MS = 5000
let chatActionTimer: ReturnType<typeof setTimeout> | null = null

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)

const wrapEntity = (entity: MessageEntity, inner: string): string => {
  switch (entity.type) {
    case "bold":
      return `<strong>${inner}</strong>`
    case "italic":
      return `<em>${inner}</em>`
    case "underline":
      return `<u>${inner}</u>`
    case "strikethrough":
      return `<s>${inner}</s>`
    case "code":
      return `<code class="msg-code">${inner}</code>`
    case "pre":
      return `<pre class="msg-pre">${inner}</pre>`
    case "text_link":
      return entity.url
        ? `<a href="${escapeHtml(entity.url)}" target="_blank" rel="noopener" class="msg-link">${inner}</a>`
        : inner
    case "url":
      return `<a href="${inner}" target="_blank" rel="noopener" class="msg-link">${inner}</a>`
    case "bot_command":
      return `<button type="button" class="msg-command" data-command="${inner}">${inner}</button>`
    case "spoiler":
      return `<span class="msg-spoiler">${inner}</span>`
    case "blockquote":
    case "expandable_blockquote":
      return `<span class="msg-quote">${inner}</span>`
    default:
      return inner
  }
}

const renderEntitiesHtml = (text: string, entities: readonly MessageEntity[]): string => {
  const sorted = [...entities].sort((a, b) => a.offset - b.offset || b.length - a.length)
  let html = ""
  let cursor = 0
  for (const entity of sorted) {
    if (entity.offset < cursor) continue
    html += escapeHtml(text.slice(cursor, entity.offset))
    const inner = escapeHtml(text.slice(entity.offset, entity.offset + entity.length))
    html += wrapEntity(entity, inner)
    cursor = entity.offset + entity.length
  }
  html += escapeHtml(text.slice(cursor))
  return html
}

/** A short label for media attachments the chat cannot display. */
const describeMedia = (message: Message): string | undefined => {
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

export const chatState = () => ({
  chatMessages: [] as Message[],
  chatInput: "",
  chatDraft: null as EmulatorDraft | null,
  chatReactions: {} as Record<number, string[]>
})

export const chatMethods = {
  applyChatEvent(this: any, event: EmulatorEvent) {
    if (event.type === "message") {
      if (this.isBotMessage(event.message)) this.botBusy = false
      this.chatMessages.push(event.message)
      this._scrollChat()
    } else if (event.type === "message_edited") {
      const index = this.chatMessages.findIndex(
        (m: Message) => m.message_id === event.message.message_id
      )
      if (index !== -1) this.chatMessages.splice(index, 1, event.message)
    } else if (event.type === "message_deleted") {
      this.chatMessages = this.chatMessages.filter(
        (m: Message) => m.message_id !== event.message_id
      )
    } else if (event.type === "callback_answered" && event.text) {
      this._showToast(event.text, "success")
    } else if (event.type === "draft") {
      this.chatDraft = event.draft
      this.botBusy = false
      this._scrollChat()
    } else if (event.type === "draft_cleared") {
      this.chatDraft = null
    } else if (event.type === "chat_action") {
      // A chat action shows the typing indicator for a few seconds
      this.botBusy = true
      if (chatActionTimer) clearTimeout(chatActionTimer)
      chatActionTimer = setTimeout(() => {
        this.botBusy = false
      }, CHAT_ACTION_MS)
    } else if (event.type === "reactions") {
      if (event.reactions.length === 0) {
        delete this.chatReactions[event.message_id]
      } else {
        this.chatReactions[event.message_id] = event.reactions
      }
    }
  },

  sendChatMessage(this: any) {
    const text = this.chatInput.trim()
    if (!text) return
    if (this.botDot !== "running") {
      this._showToast("Bot is not running — press Run", "error")
      return
    }
    this._sendToWorker({ command: "user-message", text })
    this.chatInput = ""
    this.botBusy = true
    this._scrollChat()
  },

  sendQuickCommand(this: any, text: string) {
    this.chatInput = text
    this.sendChatMessage()
  },

  /** Send a picked file to the bot as the user (photo for images). */
  async attachChatFile(this: any, input: HTMLInputElement) {
    const file = input.files?.[0]
    input.value = ""
    if (!file) return
    if (this.botDot !== "running") {
      this._showToast("Bot is not running — press Run", "error")
      return
    }
    const bytes = await file.arrayBuffer()
    this._sendToWorker({
      command: "user-file",
      file_name: file.name,
      bytes,
      kind: file.type.startsWith("image/") ? "photo" : "document",
      ...(this.chatInput.trim() ? { caption: this.chatInput.trim() } : {})
    })
    this.chatInput = ""
    this.botBusy = true
  },

  /** Double-click on a bubble: toggle the user's 👍 reaction. */
  toggleReaction(this: any, message: Message) {
    const current: string[] = this.chatReactions[message.message_id] ?? []
    this._sendToWorker({
      command: "user-react",
      message_id: message.message_id,
      emoji: current.includes("👍") ? null : "👍"
    })
  },

  tapChatButton(this: any, button: InlineKeyboardButton, message: Message) {
    if (button.url) {
      window.open(button.url, "_blank", "noopener")
      return
    }
    if (button.copy_text) {
      navigator.clipboard?.writeText(button.copy_text.text)
      this._showToast("Copied to clipboard", "success")
      return
    }
    if (!button.callback_data) return
    this._sendToWorker({
      command: "tap-button",
      data: button.callback_data,
      message_id: message.message_id
    })
    this.botBusy = true
  },

  isBotMessage(this: any, message: Message) {
    return message.from?.is_bot === true
  },

  /**
   * Message content as sanitized HTML for `x-html`: rich blocks when the
   * message is a rich message, otherwise text with its entities applied
   * (nested/overlapping entities are dropped — the outermost range wins).
   */
  renderMessageHtml(this: any, message: Message): string {
    if (message.rich_message) return renderRichMessageHtml(message.rich_message)
    const withCaption = message as Message & {
      caption?: string
      caption_entities?: MessageEntity[]
    }
    const text = message.text ?? withCaption.caption ?? ""
    const entities = message.entities ?? withCaption.caption_entities ?? []
    const media = describeMedia(message)
    return (
      (media ? `<span class="msg-media">${media}</span> ` : "") + renderEntitiesHtml(text, entities)
    )
  },

  /** The streamed draft as HTML: rich blocks, entity text, or "Thinking…". */
  renderDraftHtml(this: any): string {
    const draft: EmulatorDraft | null = this.chatDraft
    if (!draft) return ""
    if (draft.thinking) return `<span class="draft-thinking">Thinking…</span>`
    if (draft.rich_message) return renderRichMessageHtml(draft.rich_message)
    return renderEntitiesHtml(draft.text ?? "", draft.entities ?? [])
  },

  onBubbleClick(this: any, event: MouseEvent, message?: Message) {
    const target = (event.target as HTMLElement).closest?.(
      "[data-command], [data-callback], [data-copy]"
    ) as HTMLElement | null
    if (!target) return
    if (target.dataset["command"]) {
      this.sendQuickCommand(target.dataset["command"])
    } else if (target.dataset["copy"] !== undefined) {
      navigator.clipboard?.writeText(target.dataset["copy"])
      this._showToast("Copied to clipboard", "success")
    } else if (target.dataset["callback"] && message) {
      this._sendToWorker({
        command: "tap-button",
        data: target.dataset["callback"],
        message_id: message.message_id
      })
      this.botBusy = true
    }
  },

  keyboardRows(this: any, message: Message): InlineKeyboardButton[][] {
    const markup = message.reply_markup
    if (markup && "inline_keyboard" in markup) return markup.inline_keyboard
    return []
  },

  messageTime(this: any, message: Message) {
    return new Date(message.date * 1000).toLocaleTimeString("en-GB", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit"
    })
  },

  _scrollChat(this: any) {
    this.$nextTick(() => {
      const el = this.$refs.chatContainer as HTMLElement | undefined
      if (el) el.scrollTop = el.scrollHeight
    })
  }
}
