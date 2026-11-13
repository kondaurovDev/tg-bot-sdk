/**
 * @module playground
 * `<Playground>`: write a bot in Monaco, run it in a Web Worker against the
 * in-browser emulator (chatting with it in `<Chat>`) or against a real bot
 * token (chatting in Telegram). Edits are saved per example and restart
 * the bot once they compile.
 */
import {
  Chat,
  PhoneFrame,
  type ChatPortEvent,
  type EmulatorPort
} from "@effect-ak/tg-bot-emulator-react"
import { useCallback, useEffect, useReducer, useRef, useState, type PointerEvent } from "react"

import { createBotRunner } from "./bot-runner"
import { ConsolePanel } from "./console-panel"
import { useDialogs, useToasts } from "./dialogs"
import { ExamplePicker } from "./example-picker"
import { DEFAULT_EXAMPLE, findExample } from "./examples"
import { initialLogs, logsReducer } from "./logs"
import type { CodeEditor } from "./monaco"
import { MonacoPane } from "./monaco-pane"
import type { PlaygroundMode, WorkerEvent } from "./protocol"
import { storage } from "./storage"
import { decodeCode, encodeCode, readShareLink, shareLink } from "./share"
import { deleteWebhook, getBotName, getWebhook } from "./telegram"
import { useTheme } from "./theme"

type BotStatus = "idle" | "running" | "error"

/** What the toolbar says about the code and the bot it became. */
type Build =
  | { kind: "idle" }
  | { kind: "editing" }
  | { kind: "compiling" }
  | { kind: "running"; at: number; restarted: boolean }
  | { kind: "errors" }
  | { kind: "failed" }

const clock = (at: number) =>
  new Date(at).toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit" })

interface RealBot {
  token: string
  name: string
}

// Edits restart the bot this long after the last keystroke, once they compile
const RESTART_DELAY_MS = 1500

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent)

// The chat before the first run: it has nothing to talk to
const idlePort = (): EmulatorPort => {
  const listeners = new Set<(event: ChatPortEvent) => void>()
  const refuse = () => {
    for (const listener of listeners) {
      listener({ type: "action_error", error: "Bot is not running — press Run" })
    }
  }
  return {
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    sendMessage: refuse,
    sendFile: refuse,
    tapButton: refuse,
    react: refuse,
    deleteMessage: refuse,
    getFile: () => Promise.reject(new Error("Bot is not running")),
    widgetRequest: () => Promise.resolve({ ok: false, code: "NOT_ALLOWED" }),
    sendInlineQuery: refuse,
    chooseInlineResult: refuse
  }
}

export interface PlaygroundProps {
  /** Where the header's back link goes. Default: `"/"`. */
  docsHref?: string
}

export const Playground = ({ docsHref = "/" }: PlaygroundProps) => {
  const [runner] = useState(createBotRunner)
  // A link may name the example (?example=) and carry code (#code=)
  const [link] = useState(() => readShareLink(new URL(window.location.href)))
  const [mode, setMode] = useState<PlaygroundMode>(storage.mode)
  const [example, setExample] = useState(() => {
    const wanted = link.example ?? storage.example()
    return wanted && findExample(wanted) ? wanted : DEFAULT_EXAMPLE
  })
  const [build, setBuild] = useState<Build>({ kind: "idle" })
  const [theme, setTheme] = useTheme()
  const [status, setStatus] = useState<BotStatus>("idle")
  const [port, setPort] = useState<EmulatorPort>(idlePort)
  const [real, setReal] = useState<RealBot | null>(null)
  const [errorCount, setErrorCount] = useState(0)
  const [modified, setModified] = useState(false)
  const [logs, dispatchLogs] = useReducer(logsReducer, initialLogs)
  const [logsOpen, setLogsOpen] = useState(() => storage.mode() === "real")
  const [editorWidth, setEditorWidth] = useState(60)
  const [dragging, setDragging] = useState(false)
  const toasts = useToasts()
  const dialogs = useDialogs()
  const { confirm, promptToken } = dialogs
  const main = useRef<HTMLElement>(null)

  // What callbacks registered once (the editor's, the worker's) need now
  const editor = useRef<CodeEditor | null>(null)
  const latest = useRef({ mode, example, status, real })
  latest.current = { ...latest.current, mode, status, real }
  const restartTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const quietStart = useRef(false)
  const showToast = toasts.show

  const run = useCallback(async () => {
    clearTimeout(restartTimer.current)
    setBuild({ kind: "compiling" })
    const code = await editor.current?.compile()
    const { mode, real, status } = latest.current
    if (!code || (mode === "real" && !real)) {
      setBuild({ kind: "idle" })
      return
    }
    const restarting = status === "running"
    // Restarts happen on every edit in the emulator: no toast for them
    quietStart.current = restarting
    dispatchLogs({ type: "new-run" })
    setPort(runner.run({ mode, code, ...(mode === "real" && real ? { token: real.token } : {}) }))
    setStatus("running")
    latest.current.status = "running"
    setBuild({ kind: "running", at: Date.now(), restarted: restarting })
    if (restarting && mode === "real") showToast("Bot restarted", "success")
  }, [runner, showToast])

  const stop = useCallback(
    (notice: boolean) => {
      runner.stop()
      setPort(idlePort())
      setStatus("idle")
      latest.current.status = "idle"
      setBuild({ kind: "idle" })
      if (notice) showToast("Bot stopped", "success")
    },
    [runner, showToast]
  )

  // The worker's events: the console, the bot's status, the toasts
  useEffect(
    () =>
      runner.onEvent((event: WorkerEvent) => {
        dispatchLogs({ type: "event", event })
        if (event.type === "bot-state") {
          setStatus(event.state === "active" ? "running" : "idle")
          // The emulator starts the bot by itself; only a real bot's start is news
          if (event.notice && !quietStart.current && latest.current.mode === "real") {
            showToast(event.notice, "success")
          }
          quietStart.current = false
        } else if (event.type === "error") {
          quietStart.current = false
          setStatus("error")
          latest.current.status = "error"
          setBuild({ kind: "failed" })
          setLogsOpen(true)
          showToast(event.error, "error")
        }
      }),
    [runner, showToast]
  )

  useEffect(() => () => runner.stop(), [runner])

  // Monaco has its own themes; the editor may come after the first render
  useEffect(() => editor.current?.setTheme(theme), [theme])

  // The split's position, read by the stylesheet
  useEffect(() => {
    main.current?.style.setProperty("--pg-editor-width", `${editorWidth}%`)
  }, [editorWidth])

  // ⌘⏎ / Ctrl+⏎ runs the bot
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      const { mode, real } = latest.current
      if (mode === "virtual" || real) void run()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [run])

  const saveCode = () => {
    const shipped = findExample(latest.current.example)
    const code = editor.current?.model.getValue()
    if (shipped && code !== undefined) storage.saveCode(shipped.file, code, shipped.code)
  }

  const connect = useCallback(
    async (token: string) => {
      const disconnect = () => {
        setReal(null)
        latest.current.real = null
        setStatus("idle")
      }
      try {
        const [name, webhook] = await Promise.all([getBotName(token), getWebhook(token)])
        if (!name) {
          showToast("Invalid bot token", "error")
          disconnect()
          return
        }
        if (webhook) {
          dispatchLogs({ type: "note", level: "warn", text: `Webhook set: ${webhook.url}` })
          const remove = await confirm({
            title: "Webhook detected",
            description:
              `This bot has an active webhook:\n${webhook.url}\n` +
              `Pending updates: ${webhook.pending}\n\n` +
              "Polling won't work while a webhook is set.",
            confirmLabel: "Delete webhook"
          })
          if (!remove) {
            disconnect()
            return
          }
          if (!(await deleteWebhook(token))) {
            showToast("Failed to delete webhook", "error")
            disconnect()
            return
          }
          showToast("Webhook deleted", "success")
        }
        const bot = { token, name }
        setReal(bot)
        latest.current.real = bot
        storage.setToken(token)
        void run()
      } catch (error) {
        showToast(`Connection failed: ${String(error)}`, "error")
        disconnect()
      }
    },
    [confirm, run, showToast]
  )

  // Shared code becomes this visitor's edits of the example, and leaves the
  // address bar: a reload shows the visitor's code, not the link's again
  const openSharedCode = async (file: string, original: string): Promise<string | null> => {
    if (!link.code) return null
    const shared = await decodeCode(link.code)
    window.history.replaceState(null, "", shareLink(new URL(window.location.href), file, null))
    if (shared === null) {
      showToast("The link's code could not be read", "error")
      return null
    }
    storage.saveCode(file, shared, original)
    showToast("Opened the shared code", "success")
    return shared
  }

  const onEditorReady = async (ready: CodeEditor) => {
    editor.current = ready
    ready.setTheme(theme)
    const file = latest.current.example
    const original = findExample(file)?.code ?? ""
    storage.setExample(file)
    const shared = await openSharedCode(file, original)
    ready.model.setValue(shared ?? storage.code(file) ?? original)
    setModified(ready.model.getValue() !== original)
    ready.onErrorCount(setErrorCount)
    ready.model.onDidChangeContent(() => {
      const current = findExample(latest.current.example)
      setModified(ready.model.getValue() !== current?.code)
      setBuild({ kind: "editing" })
      clearTimeout(restartTimer.current)
      restartTimer.current = setTimeout(async () => {
        saveCode()
        const { mode, real, status } = latest.current
        const restart = mode === "virtual" || (real !== null && status === "running")
        if (!restart) setBuild({ kind: "idle" })
        else if (await ready.hasErrors()) setBuild({ kind: "errors" })
        else void run()
      }, RESTART_DELAY_MS)
    })
    if (latest.current.mode === "virtual") void run()
    else {
      const token = storage.token()
      if (token) void connect(token)
    }
  }

  const pickExample = (file: string) => {
    const shipped = findExample(file)
    if (!shipped || !editor.current) return
    saveCode()
    setExample(file)
    latest.current.example = file
    storage.setExample(file)
    window.history.replaceState(null, "", shareLink(new URL(window.location.href), file, null))
    editor.current.model.setValue(storage.code(file) ?? shipped.code)
    dispatchLogs({ type: "note", level: "info", text: `Switched to ${file}` })
    if (mode === "virtual" || real) void run()
  }

  const resetExample = async () => {
    const shipped = findExample(example)
    const confirmed = await confirm({
      title: "Reset the example?",
      description: "Your changes to this example will be replaced with its original code.",
      confirmLabel: "Reset"
    })
    if (!confirmed || !shipped || !editor.current) return
    storage.saveCode(shipped.file, shipped.code, shipped.code)
    editor.current.model.setValue(shipped.code)
    if (mode === "virtual" || real) void run()
  }

  const switchMode = (next: PlaygroundMode) => {
    if (next === mode) return
    setMode(next)
    latest.current.mode = next
    storage.setMode(next)
    setLogsOpen(next === "real")
    stop(false)
    if (next === "virtual") void run()
    else {
      const token = storage.token()
      if (token && !real) void connect(token)
    }
  }

  const connectBot = async () => {
    const token = await promptToken(storage.token() ?? "")
    if (token) await connect(token)
  }

  const forgetToken = () => {
    storage.setToken(null)
    if (real) stop(true)
    setReal(null)
    latest.current.real = null
  }

  const startDrag = (event: PointerEvent) => {
    event.preventDefault()
    setDragging(true)
    const onMove = (move: globalThis.PointerEvent) => {
      const rect = main.current?.getBoundingClientRect()
      if (!rect) return
      setEditorWidth(Math.max(25, Math.min(75, ((move.clientX - rect.left) / rect.width) * 100)))
    }
    const onUp = () => {
      setDragging(false)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
  }

  const share = async () => {
    const shipped = findExample(example)
    const code = editor.current?.model.getValue()
    if (!shipped || code === undefined) return
    const encoded = code === shipped.code ? null : await encodeCode(code)
    try {
      await navigator.clipboard.writeText(
        shareLink(new URL(window.location.href), shipped.file, encoded)
      )
      showToast(encoded ? "Link with your code copied" : "Link to the example copied", "success")
    } catch {
      showToast("Could not copy the link", "error")
    }
  }

  const onChatEvent = useCallback(
    (event: ChatPortEvent) => {
      if (event.type === "action_error") showToast(event.error, "error")
    },
    [showToast]
  )

  const canRun = mode === "virtual" || real !== null

  return (
    <div className="pg-root" data-theme={theme}>
      <header className="pg-header">
        <a href={docsHref} className="pg-back" title="Docs">
          ←<span className="pg-wide-only"> Docs</span>
        </a>
        <span className="pg-brand">Playground</span>

        <div className="pg-modes">
          <button
            type="button"
            className={`pg-mode${mode === "virtual" ? " pg-active" : ""}`}
            data-testid="mode-virtual"
            title="Run the bot in an in-browser emulator — no token needed"
            onClick={() => switchMode("virtual")}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="6" y="2" width="12" height="20" rx="3" />
              <path d="M11 18h2" strokeLinecap="round" />
            </svg>
            Emulator
          </button>
          <button
            type="button"
            className={`pg-mode${mode === "real" ? " pg-active" : ""}`}
            data-testid="mode-real"
            title="Run against your real Telegram bot via its token"
            onClick={() => switchMode("real")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.4 21.6 22.8 12 2.4 2.4l.01 7.2 14.4 2.4-14.4 2.4z" />
            </svg>
            Real bot
          </button>
        </div>

        {mode === "real" && canRun && (
          <button
            type="button"
            className={status === "running" ? "pg-run pg-run-stop" : "pg-run"}
            data-testid="run"
            onClick={() => (status === "running" ? stop(true) : void run())}
          >
            {status === "running" ? "■ Stop" : "▶ Run"}
            {status !== "running" && <span className="pg-run-hint">{isMac ? "⌘⏎" : "Ctrl+⏎"}</span>}
          </button>
        )}

        <div className="pg-header-end">
          <button
            type="button"
            className="pg-theme-toggle"
            data-testid="theme-toggle"
            title={theme === "dark" ? "Switch to the light theme" : "Switch to the dark theme"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          {mode === "real" ? (
            <>
              <span className="pg-status pg-wide-only">
                <span className={`pg-dot pg-dot-${status}`} />
                {real ? <span className="pg-bot-name">@{real.name}</span> : "Not connected"}
              </span>
              <button
                type="button"
                className={real ? "pg-button-quiet" : "pg-button-primary"}
                data-testid="connect"
                onClick={() => void connectBot()}
              >
                {real ? "Reconnect" : "Connect bot"}
              </button>
              {real && storage.token() && (
                <button
                  type="button"
                  className="pg-forget"
                  title="Remove saved token"
                  onClick={forgetToken}
                >
                  Forget
                </button>
              )}
            </>
          ) : (
            <span className="pg-status pg-desktop-only">
              <span className={`pg-dot pg-dot-${status}`} />
              in-browser emulator
            </span>
          )}
        </div>
      </header>

      <main ref={main} className={`pg-main${dragging ? " pg-dragging" : ""}`}>
        <section className="pg-editor-pane">
          <div className="pg-toolbar">
            <span className="pg-toolbar-label">Example</span>
            <ExamplePicker active={example} onPick={pickExample} />
            {modified && (
              <button
                type="button"
                className="pg-reset"
                data-testid="example-reset"
                title="Discard your edits and restore the example's original code"
                onClick={() => void resetExample()}
              >
                Reset
              </button>
            )}
            <div className="pg-toolbar-end">
              <BuildStatus
                build={build}
                errorCount={errorCount}
                onErrors={() => editor.current?.revealFirstError()}
                onFailed={() => setLogsOpen(true)}
              />
              <button
                type="button"
                className="pg-share"
                data-testid="share"
                title="Copy a link to this example, with your code if you changed it"
                onClick={() => void share()}
              >
                Share
              </button>
            </div>
          </div>
          <MonacoPane onReady={(ready) => void onEditorReady(ready)} />
        </section>

        <div className={`pg-divider${dragging ? " pg-dragging" : ""}`} onPointerDown={startDrag} />

        <section className="pg-side">
          {mode === "virtual" ? (
            <div className="pg-stage">
              <PhoneFrame theme={theme}>
                <Chat
                  port={port}
                  title="Playground Bot"
                  botUsername="emulator_bot"
                  theme={theme}
                  status={status}
                  onRestart={() => void run()}
                  onNotice={showToast}
                  onEvent={onChatEvent}
                />
              </PhoneFrame>
            </div>
          ) : (
            <div className="pg-stage">
              <div className="pg-real-card">
                <div className="pg-real-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.4 21.6 22.8 12 2.4 2.4l.01 7.2 14.4 2.4-14.4 2.4z" />
                  </svg>
                </div>
                {real ? (
                  <>
                    <h2 className="pg-real-title">Your bot is live</h2>
                    <p className="pg-real-text">
                      Open it in Telegram and send a message — updates show up in the console below.
                    </p>
                    <a
                      className="pg-button-primary"
                      href={`https://t.me/${real.name}`}
                      target="_blank"
                      rel="noopener"
                    >
                      Open @{real.name}
                    </a>
                  </>
                ) : (
                  <>
                    <h2 className="pg-real-title">Connect your bot</h2>
                    <p className="pg-real-text">
                      Paste a token from BotFather to run the code against your real Telegram bot.
                    </p>
                    <button
                      type="button"
                      className="pg-button-primary"
                      onClick={() => void connectBot()}
                    >
                      Connect bot
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          <ConsolePanel
            logs={logs}
            open={logsOpen}
            onToggle={() => setLogsOpen(!logsOpen)}
            onClear={() => dispatchLogs({ type: "clear" })}
          />
        </section>
      </main>

      {toasts.element}
      {dialogs.element}
    </div>
  )
}

interface BuildStatusProps {
  build: Build
  errorCount: number
  onErrors(): void
  onFailed(): void
}

/** "Compiling…", "Bot restarted 18:42", or the errors that kept it from restarting. */
const BuildStatus = ({ build, errorCount, onErrors, onFailed }: BuildStatusProps) => {
  const errors = `${errorCount} error${errorCount === 1 ? "" : "s"}`
  const errorButton = (label: string) => (
    <button
      type="button"
      className="pg-build-errors"
      data-testid="errors-button"
      title="Go to the first error"
      onClick={onErrors}
    >
      {label}
    </button>
  )
  let status
  switch (build.kind) {
    case "editing":
      status = <span className="pg-build-muted">Editing…</span>
      break
    case "compiling":
      status = <span className="pg-build-muted">Compiling…</span>
      break
    case "running":
      status = (
        <span className="pg-build-ok">
          {build.restarted ? "Bot restarted" : "Bot started"} {clock(build.at)}
        </span>
      )
      break
    case "errors":
      return (
        <span className="pg-build" data-testid="build-status" data-state="errors">
          {errorButton(`${errors} · bot not restarted`)}
        </span>
      )
    case "failed":
      status = (
        <button type="button" className="pg-build-errors" onClick={onFailed}>
          Bot failed to start · console
        </button>
      )
      break
    case "idle":
      status = null
  }
  return (
    <span className="pg-build" data-testid="build-status" data-state={build.kind}>
      {status}
      {errorCount > 0 && errorButton(errors)}
    </span>
  )
}
