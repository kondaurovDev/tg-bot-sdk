/**
 * @module chat-message
 * One message: the bubble, its reactions and inline keyboard. A right
 * click or a long press opens the message menu; a double click or a double
 * tap toggles the quick reaction.
 */
import type { InlineKeyboardButton, Message } from "@effect-ak/tg-bot-api"
import { useRef, type MouseEvent, type TouchEvent } from "react"

import { RichMessageView } from "./render-rich"
import {
  describeMedia,
  renderEntities,
  ReplyQuote,
  textOf,
  type RenderHandlers
} from "./render-text"

const DOUBLE_TAP_MS = 350
// iOS sends no contextmenu: holding a bubble this long opens its menu
const LONG_PRESS_MS = 450
const LONG_PRESS_SLOP_PX = 10

export const isBotMessage = (message: Message) => message.from?.is_bot === true

export const messageTime = (date: number) =>
  new Date(date * 1000).toLocaleTimeString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit"
  })

const keyboardRows = (message: Message): InlineKeyboardButton[][] => {
  const markup = message.reply_markup
  return markup && "inline_keyboard" in markup ? markup.inline_keyboard : []
}

// A click on something tappable inside the bubble is that thing's
const isInteractive = (target: EventTarget) =>
  target instanceof Element && target.closest("button, a, summary") !== null

export const MessageContent = ({ message, h }: { message: Message; h: RenderHandlers }) => {
  if (message.rich_message) return <RichMessageView rich={message.rich_message} h={h} />
  const media = describeMedia(message)
  const entities = message.entities ?? message.caption_entities ?? []
  return (
    <>
      <ReplyQuote message={message} />
      {media && <span className="tgc-media">{media} </span>}
      {renderEntities(textOf(message) ?? "", entities, h)}
    </>
  )
}

export interface MessageRowProps {
  message: Message
  reactions: readonly string[] | undefined
  handlers: RenderHandlers
  onMenu(message: Message, x: number, y: number): void
  onQuickReact(message: Message): void
  onKeyboardButton(button: InlineKeyboardButton, message: Message): void
}

export const MessageRow = ({
  message,
  reactions,
  handlers,
  onMenu,
  onQuickReact,
  onKeyboardButton
}: MessageRowProps) => {
  const fromBot = isBotMessage(message)
  const lastTap = useRef(0)
  const press = useRef<{
    timer: ReturnType<typeof setTimeout>
    x: number
    y: number
    fired: boolean
  }>(undefined)

  const cancelPress = () => {
    if (press.current) clearTimeout(press.current.timer)
    press.current = undefined
  }

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    if (!touch || event.touches.length > 1) return
    cancelPress()
    const x = touch.clientX
    const y = touch.clientY
    const current = {
      x,
      y,
      fired: false,
      timer: setTimeout(() => {
        current.fired = true
        onMenu(message, x, y)
      }, LONG_PRESS_MS)
    }
    press.current = current
  }

  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0]
    const current = press.current
    if (!touch || !current) return
    if (Math.hypot(touch.clientX - current.x, touch.clientY - current.y) > LONG_PRESS_SLOP_PX) {
      cancelPress()
    }
  }

  // A press that opened the menu swallows its click, which would land
  // outside the menu and close it
  const onTouchEnd = (event: TouchEvent) => {
    if (press.current?.fired) event.preventDefault()
    cancelPress()
  }

  const onClick = (event: MouseEvent) => {
    if (isInteractive(event.target)) return
    const now = Date.now()
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0
      onQuickReact(message)
      return
    }
    lastTap.current = now
  }

  return (
    <div className={`tgc-row ${fromBot ? "tgc-row-in" : "tgc-row-out"}`}>
      <div className="tgc-row-body">
        <div
          className={`tgc-bubble ${fromBot ? "tgc-bubble-in" : "tgc-bubble-out"}`}
          data-testid="message"
          data-from={fromBot ? "bot" : "user"}
          data-message-id={message.message_id}
          onClick={onClick}
          // A double click selects a word; here it reacts
          onMouseDown={(event) => event.detail > 1 && event.preventDefault()}
          onContextMenu={(event) => {
            event.preventDefault()
            onMenu(message, event.clientX, event.clientY)
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={cancelPress}
        >
          <MessageContent message={message} h={handlers} />
          <span className="tgc-meta">
            {message.edit_date !== undefined && <span>edited</span>}
            <span>{messageTime(message.date)}</span>
            {!fromBot && <span className="tgc-ticks">✓✓</span>}
          </span>
        </div>
        {reactions && reactions.length > 0 && (
          <div className="tgc-reactions">
            {reactions.map((emoji) => (
              <span key={emoji} className="tgc-reaction" data-testid="reaction">
                {emoji}
              </span>
            ))}
          </div>
        )}
        {keyboardRows(message).map((row, r) => (
          <div key={r} className="tgc-keyboard-row">
            {row.map((button, b) => (
              <button
                key={b}
                type="button"
                className="tgc-keyboard-button"
                data-testid="keyboard-button"
                onClick={() => onKeyboardButton(button, message)}
              >
                {button.text}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
