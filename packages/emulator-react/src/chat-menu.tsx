/**
 * @module chat-menu
 * The message menu, as in Telegram's desktop client: a row of reactions,
 * then Reply, Copy Text and Delete. A press outside or Escape closes it.
 */
import { useEffect, useRef } from "react"

// The panel is about 230 × 200 px; it stays inside the viewport
const MENU_WIDTH = 240
const MENU_HEIGHT = 220

export interface MessageMenuProps {
  x: number
  y: number
  quickReactions: readonly string[]
  /** The user's reactions on the message, highlighted in the row. */
  chosen: readonly string[]
  onReact(emoji: string): void
  onReply(): void
  /** Absent when the message has no text. */
  onCopy: (() => void) | undefined
  onDelete(): void
  onClose(): void
}

export const MessageMenu = ({
  x,
  y,
  quickReactions,
  chosen,
  onReact,
  onReply,
  onCopy,
  onDelete,
  onClose
}: MessageMenuProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // pointerdown, not click: iOS sends no click for a tap on a plain area
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && ref.current?.contains(event.target)) return
      onClose()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      className="tgc-menu"
      data-testid="message-menu"
      style={{
        left: Math.max(0, Math.min(x, window.innerWidth - MENU_WIDTH)),
        top: Math.max(0, Math.min(y, window.innerHeight - MENU_HEIGHT))
      }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="tgc-menu-reactions">
        {quickReactions.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className={`tgc-menu-reaction${chosen.includes(emoji) ? " tgc-chosen" : ""}`}
            onClick={() => onReact(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="tgc-menu-items">
        <button type="button" className="tgc-menu-item" onClick={onReply}>
          <span className="tgc-menu-icon">↩</span> Reply
        </button>
        {onCopy && (
          <button type="button" className="tgc-menu-item" onClick={onCopy}>
            <span className="tgc-menu-icon">❐</span> Copy Text
          </button>
        )}
        <div className="tgc-menu-separator" />
        <button type="button" className="tgc-menu-item tgc-menu-danger" onClick={onDelete}>
          <span className="tgc-menu-icon">🗑</span> Delete
        </button>
      </div>
    </div>
  )
}
