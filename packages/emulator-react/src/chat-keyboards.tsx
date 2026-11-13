/**
 * @module chat-keyboards
 * What sits around the composer, as in Telegram: the Menu button with the
 * bot's commands (`set_my_commands`) and the reply keyboard the bot set.
 */
import type { BotCommand, InlineQueryResult, ReplyKeyboardMarkup } from "@effect-ak/tg-bot-api"
import { useEffect, useRef, useState } from "react"

export interface CommandsMenuProps {
  commands: readonly BotCommand[]
  onPick(command: string): void
}

/** The Menu button and its list; a press outside or Escape closes it. */
export const CommandsMenu = ({ commands, onPick }: CommandsMenuProps) => {
  const [open, setOpen] = useState(false)
  const wrapper = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && wrapper.current?.contains(event.target)) return
      setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <div ref={wrapper} className="tgc-commands-wrap">
      <button
        type="button"
        className={`tgc-menu-button${open ? " tgc-open" : ""}`}
        data-testid="chat-menu"
        title="The bot's commands"
        onClick={() => setOpen(!open)}
      >
        <span className="tgc-menu-button-icon">{open ? "×" : "≡"}</span>
        Menu
      </button>
      {open && (
        <div className="tgc-commands" data-testid="commands-menu">
          {commands.map(({ command, description }) => (
            <button
              key={command}
              type="button"
              className="tgc-command-item"
              data-testid="command-item"
              data-command={`/${command}`}
              onClick={() => {
                setOpen(false)
                onPick(`/${command}`)
              }}
            >
              <span className="tgc-command-name">/{command}</span>
              <span className="tgc-command-description">{description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export interface ReplyKeyboardProps {
  keyboard: ReplyKeyboardMarkup
  onPress(text: string): void
}

/** The bot's reply keyboard under the composer: a key sends its text. */
export const ReplyKeyboard = ({ keyboard, onPress }: ReplyKeyboardProps) => (
  <div
    className={`tgc-reply-keyboard${keyboard.resize_keyboard ? " tgc-reply-keyboard-fit" : ""}`}
    data-testid="reply-keyboard"
  >
    {keyboard.keyboard.map((row, r) => (
      <div key={r} className="tgc-reply-row">
        {row.map((button, b) => (
          <button
            key={b}
            type="button"
            className="tgc-reply-key"
            data-testid="reply-keyboard-button"
            onClick={() => onPress(button.text)}
          >
            {button.text}
          </button>
        ))}
      </div>
    ))}
  </div>
)

export interface InlineResultsProps {
  results: readonly InlineQueryResult[]
  onPick(result_id: string): void
}

const resultTitle = (result: InlineQueryResult): string =>
  "title" in result && typeof result.title === "string" ? result.title : result.type

const resultDescription = (result: InlineQueryResult): string | undefined =>
  "description" in result && typeof result.description === "string" ? result.description : undefined

/** The bot's answer to `@bot query`, above the composer; a tap sends the result. */
export const InlineResults = ({ results, onPick }: InlineResultsProps) => (
  <div className="tgc-inline-results" data-testid="inline-results">
    {results.map((result) => (
      <button
        key={result.id}
        type="button"
        className="tgc-inline-result"
        data-testid="inline-result"
        data-id={result.id}
        onClick={() => onPick(result.id)}
      >
        <span className="tgc-inline-title">{resultTitle(result)}</span>
        {resultDescription(result) && (
          <span className="tgc-inline-description">{resultDescription(result)}</span>
        )}
      </button>
    ))}
  </div>
)
