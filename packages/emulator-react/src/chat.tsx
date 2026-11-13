/**
 * @module chat
 * `<Chat>`: a Telegram-like chat with the bot behind a port — header,
 * history, streamed draft, typing indicator, the message menu, and the
 * composer with replies and attachments.
 */
import type { InlineKeyboardButton, Message } from "@effect-ak/tg-bot-api"
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import { CommandsMenu, InlineResults, ReplyKeyboard } from "./chat-keyboards"
import { ChatServicesContext, type ChatServices, type ChatTheme } from "./chat-services"
import { MessageMenu } from "./chat-menu"
import { MessageRow } from "./chat-message"
import type { ChatPortEvent, EmulatorPort } from "./port"
import { RichMessageView } from "./render-rich"
import { renderEntities, textOf, type RenderHandlers } from "./render-text"
import { useChat } from "./use-chat"

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/** The query in "@<username> query", or `null` when the composer is not in inline mode. */
export const inlineQueryOf = (input: string, botUsername: string | undefined): string | null => {
  if (!botUsername) return null
  const match = new RegExp(`^@${escapeRegExp(botUsername)}(?:\\s+([\\s\\S]*))?$`, "i").exec(input)
  return match ? (match[1] ?? "") : null
}

export const QUICK_REACTIONS = ["👍", "🔥", "❤️", "😁", "🤣", "💩"]

export type NoticeKind = "success" | "error"

export interface ChatProps {
  port: EmulatorPort
  /** The bot's name in the header. Default: `"Bot"`. */
  title?: string
  /** Shown as `data-bot` on the root, for tests and styling. */
  status?: "idle" | "running" | "error"
  /** Shows a restart button in the header. */
  onRestart?: () => void
  /** Short messages for a toast: "Copied", a callback query's answer text. */
  onNotice?: (text: string, kind: NoticeKind) => void
  /** Every port event, after the chat has applied it. */
  onEvent?: (event: ChatPortEvent) => void
  /** The text over the empty chat. */
  emptyHint?: ReactNode
  /** The command the empty chat offers to send; `null` offers none. Default: `"/start"`. */
  startCommand?: string | null
  /**
   * The bot's username, without "@". Typing `@<username> query` in the
   * composer then asks the bot inline, as in Telegram.
   */
  botUsername?: string
  /** Light or dark, as Telegram's day and night themes. Default: `"light"`. */
  theme?: ChatTheme
  /** The reactions in the message menu; the first is the double-tap one. */
  quickReactions?: readonly string[]
  className?: string
}

interface MenuState {
  message: Message
  x: number
  y: number
}

export const Chat = ({
  port,
  title = "Bot",
  status,
  onRestart,
  onNotice,
  onEvent,
  emptyHint = "Your bot runs right here in the browser.",
  startCommand = "/start",
  quickReactions = QUICK_REACTIONS,
  botUsername,
  theme = "light",
  className
}: ChatProps) => {
  const handleEvent = useCallback(
    (event: ChatPortEvent) => {
      if (event.type === "callback_answered" && event.text) onNotice?.(event.text, "success")
      onEvent?.(event)
    },
    [onNotice, onEvent]
  )
  const { state, actions } = useChat(port, handleEvent)
  const [input, setInput] = useState("")
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [menu, setMenu] = useState<MenuState | null>(null)
  // The user can fold the reply keyboard away; a new one shows again
  const [keyboardFolded, setKeyboardFolded] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const busy = state.waiting || state.typing

  // A new chat (a new port) starts without a reply or a menu
  useEffect(() => {
    setReplyTo(null)
    setMenu(null)
  }, [port])

  // The reply target or the menu's message may be deleted under them
  useEffect(() => {
    const ids = new Set(state.messages.map((m) => m.message_id))
    if (replyTo && !ids.has(replyTo.message_id)) setReplyTo(null)
    if (menu && !ids.has(menu.message.message_id)) setMenu(null)
  }, [state.messages, replyTo, menu])

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [state.messages.length, state.draft])

  useEffect(() => setKeyboardFolded(false), [state.replyKeyboard])

  const replyKeyboard = state.replyKeyboard

  // Inline mode: "@<botUsername> query" in the composer
  const inlineQuery = inlineQueryOf(input, botUsername)
  const { inlineQuery: askInline, closeInline } = actions
  useEffect(() => {
    if (inlineQuery === null) {
      closeInline()
      return
    }
    // As in Telegram, the query goes out once the user pauses typing
    const timer = setTimeout(() => askInline(inlineQuery), 300)
    return () => clearTimeout(timer)
  }, [inlineQuery, askInline, closeInline])

  const copy = useCallback(
    (text: string) => {
      void navigator.clipboard?.writeText(text)
      onNotice?.("Copied to clipboard", "success")
    },
    [onNotice]
  )

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    actions.send(trimmed, replyTo ? { reply_to: replyTo.message_id } : {})
    setInput("")
    setReplyTo(null)
  }

  const services = useMemo<ChatServices>(
    () => ({
      getFile: (file_id) => port.getFile(file_id),
      widgetRequest: (message_id, data) => port.widgetRequest(message_id, data),
      copy,
      theme
    }),
    [port, copy, theme]
  )

  const handlersFor = useCallback(
    (message_id: number): RenderHandlers => ({
      command: (text) => actions.send(text),
      callback: (data) => actions.tapButton(data, message_id),
      copy
    }),
    [actions, copy]
  )
  const draftHandlers = useMemo(() => handlersFor(0), [handlersFor])

  const toggleReaction = (message: Message, emoji: string) => {
    const current = state.reactions[message.message_id] ?? []
    actions.react(message.message_id, current.includes(emoji) ? null : emoji)
  }

  const onKeyboardButton = (button: InlineKeyboardButton, message: Message) => {
    if (button.url) window.open(button.url, "_blank", "noopener")
    else if (button.copy_text) copy(button.copy_text.text)
    else if (button.callback_data) actions.tapButton(button.callback_data, message.message_id)
  }

  const attach = async (file: File | undefined) => {
    if (!file) return
    const caption = input.trim()
    actions.sendFile({
      bytes: new Uint8Array(await file.arrayBuffer()),
      file_name: file.name,
      kind: file.type.startsWith("image/") ? "photo" : "document",
      ...(caption ? { caption } : {})
    })
    setInput("")
  }

  const closeMenu = useCallback(() => setMenu(null), [])
  const menuText = menu ? textOf(menu.message) : undefined

  return (
    <ChatServicesContext.Provider value={services}>
      <div
        className={`tgc-chat${className ? ` ${className}` : ""}`}
        data-testid="chat"
        data-theme={theme}
        data-bot={status}
        data-busy={String(busy)}
      >
        <div className="tgc-header">
          <div className="tgc-avatar">{title.slice(0, 1).toUpperCase()}</div>
          <div className="tgc-header-text">
            <div className="tgc-title">{title}</div>
            <div className={`tgc-subtitle${busy ? " tgc-subtitle-busy" : ""}`}>
              {busy ? "typing…" : "bot"}
            </div>
          </div>
          {onRestart && (
            <button
              type="button"
              className="tgc-icon-button"
              data-testid="chat-restart"
              title="Restart the bot and clear the chat"
              onClick={onRestart}
            >
              ↻
            </button>
          )}
        </div>

        <div ref={scroller} className="tgc-messages" data-testid="chat-messages">
          {state.messages.map((message) => (
            <MessageRow
              key={message.message_id}
              message={message}
              reactions={state.reactions[message.message_id]}
              handlers={handlersFor(message.message_id)}
              onMenu={(m, x, y) => setMenu({ message: m, x, y })}
              onQuickReact={(m) => {
                const quick = quickReactions[0]
                if (quick) toggleReaction(m, quick)
              }}
              onKeyboardButton={onKeyboardButton}
            />
          ))}

          {state.draft && (
            <div className="tgc-row tgc-row-in" data-testid="chat-draft">
              <div className="tgc-bubble tgc-bubble-in">
                {state.draft.thinking ? (
                  <span className="tgc-thinking">Thinking…</span>
                ) : state.draft.rich_message ? (
                  <RichMessageView rich={state.draft.rich_message} h={draftHandlers} />
                ) : (
                  renderEntities(state.draft.text ?? "", state.draft.entities ?? [], draftHandlers)
                )}
                <span className="tgc-draft-cursor" />
              </div>
            </div>
          )}

          {busy && !state.draft && (
            <div className="tgc-row tgc-row-in" data-testid="chat-typing">
              <div className="tgc-bubble tgc-bubble-in tgc-typing">
                <span className="tgc-typing-dot" />
                <span className="tgc-typing-dot" />
                <span className="tgc-typing-dot" />
              </div>
            </div>
          )}

          {state.messages.length === 0 && !busy && (
            <div className="tgc-empty">
              <p>{emptyHint}</p>
              {startCommand && (
                <p>
                  Try{" "}
                  <button
                    type="button"
                    className="tgc-command"
                    data-testid="chat-start"
                    onClick={() => actions.send(startCommand)}
                  >
                    {startCommand}
                  </button>
                </p>
              )}
            </div>
          )}
        </div>

        {inlineQuery !== null && state.inlineResults.length > 0 && (
          <InlineResults
            results={state.inlineResults}
            onPick={(result_id) => {
              actions.chooseInlineResult(result_id)
              setInput("")
            }}
          />
        )}

        {replyTo && (
          <div className="tgc-reply-bar">
            <div className="tgc-reply-bar-text">
              <div className="tgc-reply-bar-name">
                Reply to {replyTo.from?.is_bot ? "Bot" : "You"}
              </div>
              <div className="tgc-reply-bar-preview">{textOf(replyTo) ?? "…"}</div>
            </div>
            <button
              type="button"
              className="tgc-icon-button"
              title="Cancel reply"
              onClick={() => setReplyTo(null)}
            >
              ×
            </button>
          </div>
        )}

        <div className="tgc-composer">
          {state.commands.length > 0 && (
            <CommandsMenu commands={state.commands} onPick={(command) => actions.send(command)} />
          )}
          <input
            ref={fileInput}
            type="file"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ""
              void attach(file)
            }}
          />
          <button
            type="button"
            className="tgc-icon-button tgc-attach"
            data-testid="chat-attach"
            title="Attach a file (typed text becomes the caption)"
            onClick={() => fileInput.current?.click()}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M21 12.5 12.6 20.9a5.5 5.5 0 0 1-7.8-7.8l8.5-8.5a3.7 3.7 0 0 1 5.2 5.2l-8.5 8.5a1.8 1.8 0 0 1-2.6-2.6l7.8-7.8" />
            </svg>
          </button>
          <input
            type="text"
            className="tgc-input"
            data-testid="chat-input"
            placeholder={replyKeyboard?.input_field_placeholder ?? "Message"}
            autoComplete="off"
            spellCheck={false}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") send(input)
            }}
          />
          {replyKeyboard && (
            <button
              type="button"
              className={`tgc-icon-button tgc-keyboard-toggle${keyboardFolded ? "" : " tgc-open"}`}
              data-testid="keyboard-toggle"
              title={keyboardFolded ? "Show the bot's keyboard" : "Hide the bot's keyboard"}
              onClick={() => setKeyboardFolded(!keyboardFolded)}
            >
              ⌨
            </button>
          )}
          <button
            type="button"
            className="tgc-send"
            data-testid="chat-send"
            title="Send"
            onClick={() => send(input)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.4 21.6 22.8 12 2.4 2.4l.01 7.2 14.4 2.4-14.4 2.4z" />
            </svg>
          </button>
        </div>

        {replyKeyboard && !keyboardFolded && (
          <ReplyKeyboard
            keyboard={replyKeyboard}
            onPress={(text) => {
              send(text)
              if (replyKeyboard.one_time_keyboard) setKeyboardFolded(true)
            }}
          />
        )}

        {menu && (
          <MessageMenu
            x={menu.x}
            y={menu.y}
            quickReactions={quickReactions}
            chosen={state.reactions[menu.message.message_id] ?? []}
            onReact={(emoji) => {
              toggleReaction(menu.message, emoji)
              closeMenu()
            }}
            onReply={() => {
              setReplyTo(menu.message)
              closeMenu()
            }}
            onCopy={
              menuText === undefined
                ? undefined
                : () => {
                    copy(menuText)
                    closeMenu()
                  }
            }
            onDelete={() => {
              actions.deleteMessage(menu.message.message_id)
              closeMenu()
            }}
            onClose={closeMenu}
          />
        )}
      </div>
    </ChatServicesContext.Provider>
  )
}
