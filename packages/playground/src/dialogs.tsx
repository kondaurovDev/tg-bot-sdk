/**
 * @module dialogs
 * Toasts and the two dialogs (the token prompt, a confirmation), each a
 * hook that returns a promise-style API and the element to render.
 */
import { useCallback, useRef, useState, type ReactNode } from "react"

export type ToastKind = "success" | "error"

interface Toast {
  id: number
  text: string
  kind: ToastKind
  leaving: boolean
}

const TOAST_MS = 2500
const TOAST_EXIT_MS = 200

export const useToasts = () => {
  const [toasts, setToasts] = useState<readonly Toast[]>([])
  const nextId = useRef(0)

  const show = useCallback((text: string, kind: ToastKind) => {
    const id = nextId.current++
    setToasts((all) => [...all, { id, text, kind, leaving: false }])
    setTimeout(() => {
      setToasts((all) => all.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
      setTimeout(() => setToasts((all) => all.filter((t) => t.id !== id)), TOAST_EXIT_MS)
    }, TOAST_MS)
  }, [])

  const element = (
    <div className="pg-toasts">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pg-toast pg-toast-${toast.kind}${toast.leaving ? " pg-toast-leaving" : ""}`}
          data-testid="toast"
          data-type={toast.kind}
        >
          {toast.text}
        </div>
      ))}
    </div>
  )
  return { show, element }
}

interface ConfirmOptions {
  title: string
  description: string
  confirmLabel: string
}

type Dialog =
  | { kind: "token"; value: string; error: string; resolve: (token: string | null) => void }
  | ({ kind: "confirm"; resolve: (ok: boolean) => void } & ConfirmOptions)

export const useDialogs = () => {
  const [dialog, setDialog] = useState<Dialog | null>(null)

  const promptToken = useCallback(
    (initial: string) =>
      new Promise<string | null>((resolve) =>
        setDialog({ kind: "token", value: initial, error: "", resolve })
      ),
    []
  )
  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setDialog({ kind: "confirm", ...options, resolve })),
    []
  )

  let element: ReactNode = null
  if (dialog?.kind === "token") {
    const close = (token: string | null) => {
      setDialog(null)
      dialog.resolve(token)
    }
    const submit = () => {
      const token = dialog.value.trim()
      if (token) close(token)
      else setDialog({ ...dialog, error: "Token is required" })
    }
    element = (
      <div className="pg-dialog-backdrop">
        <div
          className="pg-dialog"
          onKeyDown={(event) => {
            if (event.key === "Escape") close(null)
          }}
        >
          <h3 className="pg-dialog-title">Connect your bot</h3>
          <input
            className="pg-dialog-input"
            type="text"
            placeholder="Paste bot token from BotFather"
            autoComplete="off"
            spellCheck={false}
            autoFocus
            value={dialog.value}
            onChange={(event) => setDialog({ ...dialog, value: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit()
            }}
          />
          {dialog.error && <p className="pg-dialog-error">{dialog.error}</p>}
          <div className="pg-dialog-actions">
            <button type="button" className="pg-button-quiet" onClick={() => close(null)}>
              Cancel
            </button>
            <button type="button" className="pg-button-primary" onClick={submit}>
              Connect
            </button>
          </div>
        </div>
      </div>
    )
  } else if (dialog?.kind === "confirm") {
    const close = (ok: boolean) => {
      setDialog(null)
      dialog.resolve(ok)
    }
    element = (
      <div className="pg-dialog-backdrop">
        <div className="pg-dialog">
          <h3 className="pg-dialog-title">{dialog.title}</h3>
          <p className="pg-dialog-text">{dialog.description}</p>
          <div className="pg-dialog-actions">
            <button type="button" className="pg-button-quiet" onClick={() => close(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="pg-button-danger"
              data-testid="confirm"
              onClick={() => close(true)}
            >
              {dialog.confirmLabel}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return { promptToken, confirm, element }
}
