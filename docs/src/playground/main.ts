import { createEditor, loadExample, type PlaygroundEditor } from "./editor"
import { createWorkerManager, type WorkerManager } from "./worker-manager"

type BotDot = "idle" | "running" | "error"

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  time: string
  text: string
  level: LogLevel
  isUpdate: boolean
  isHandleResult: boolean
  handleStatus?: "handled" | "ignored" | "no_handler" | "error"
  collapsed: boolean
}

interface ToastEntry {
  id: number
  text: string
  type: "success" | "error"
  exiting: boolean
}

const STORAGE_KEY = "playground_bot_token"
const CODE_STORAGE_PREFIX = "playground_code:"
const ACTIVE_EXAMPLE_KEY = "playground_active_example"
const COLLAPSE_THRESHOLD = 3

const dotClasses: Record<BotDot, string> = {
  idle: "bg-gray-300",
  running: "bg-green-500 dot-pulse",
  error: "bg-red-500"
}

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent)

function formatUpdateSummary(update: Record<string, unknown>): string {
  const msg = update["message"] as Record<string, unknown> | undefined
  if (msg) {
    const from = msg["from"] as Record<string, unknown> | undefined
    const name = from?.["username"] ?? from?.["first_name"] ?? "unknown"
    const text = msg["text"] as string | undefined
    if (text) return `@${name}: ${text}`

    if (msg["photo"]) return `@${name} sent a photo`
    if (msg["document"]) return `@${name} sent a document`
    if (msg["sticker"]) return `@${name} sent a sticker`
    if (msg["voice"]) return `@${name} sent a voice message`
    if (msg["video"]) return `@${name} sent a video`
    return `@${name} sent a message`
  }

  const cb = update["callback_query"] as Record<string, unknown> | undefined
  if (cb) {
    const from = cb["from"] as Record<string, unknown> | undefined
    const name = from?.["username"] ?? from?.["first_name"] ?? "unknown"
    return `@${name} callback: ${cb["data"] ?? ""}`
  }

  // Fallback for other update types
  const type = Object.keys(update).find((k) => k !== "update_id") ?? "unknown"
  return `${type} #${update["update_id"]}`
}

export function registerPlayground(Alpine: import("alpinejs").Alpine) {
  Alpine.data("playground", () => {
    // Closure variables — NOT wrapped in Alpine's reactive proxy.
    // Monaco editor and Web Worker have huge internal object graphs
    // that would freeze the page if proxied.
    let editor: PlaygroundEditor | null = null
    let worker: WorkerManager | null = null
    let saveTimer: ReturnType<typeof setTimeout> | null = null
    let toastCounter = 0
    let pendingRestart = false

    function setupWorkerMessages(self: any) {
      worker!.onMessage((msg) => {
        const data = msg.data
        if (data?.["newBotState"]) {
          const botState = data["newBotState"] as string
          if (botState === "active") self.botDot = "running"
          else if (botState === "stopped") self.botDot = "idle"
          // Suppress "Bot started" toast when we already showed "Bot restarted"
          if (data["success"]) {
            if (pendingRestart) {
              pendingRestart = false
            } else {
              self._showToast(data["success"] as string, "success")
            }
          }
          if (data["error"]) {
            pendingRestart = false
            self._showToast(data["error"] as string, "error")
          }
          return
        }
        if (data?.["error"]) {
          self.botDot = "error"
          self._showToast(data["error"] as string, "error")
          return
        }
        if (data?.["type"] === "handle-result") {
          self._addHandleResultLog(data)
        } else if (data?.["type"] === "update") {
          self._addUpdateLog(data["update"])
        } else if (data?.["type"] === "log") {
          self._addConsoleLog(data["text"] as string, data["level"] as string)
        } else {
          self._addLog(data)
        }
      })
    }

    let currentExample = "empty.ts"

    function scheduleSave(self: any) {
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(async () => {
        if (!editor) return
        localStorage.setItem(CODE_STORAGE_PREFIX + currentExample, editor.model.getValue())

        // Auto-restart bot if connected and no compilation errors
        if (self.isConnected && self.botDot === "running") {
          const errors = await editor.hasErrors()
          if (!errors) {
            self.runCurrentCode()
          }
        }
      }, 1500)
    }

    return {
      // -- reactive state --
      token: "",
      botName: "",
      isConnected: false,
      botDot: "idle" as BotDot,
      logs: [] as LogEntry[],
      stats: { handled: 0, ignored: 0, noHandler: 0, errors: 0 },
      toasts: [] as ToastEntry[],
      errorCount: 0,
      verbose: false,
      editorWidth: 60,
      isDragging: false,
      activeExample: localStorage.getItem(ACTIVE_EXAMPLE_KEY) ?? "empty.ts",

      tokenModal: {
        open: false,
        value: "",
        error: "",
        _resolve: null as ((v: string | null) => void) | null
      },

      confirmModal: {
        open: false,
        description: "",
        _resolve: null as ((v: boolean) => void) | null
      },

      // -- computed --
      get filteredLogs() {
        if (this.verbose) return this.logs
        return this.logs.filter((l: LogEntry) => l.level !== "debug")
      },

      get dotClass() {
        return dotClasses[this.botDot]
      },

      get statusClass() {
        if (this.isConnected) return "text-sm"
        return this.botDot === "idle" ? "text-gray-400" : "text-gray-500"
      },

      get statusText() {
        if (this.isConnected) {
          return `<span class="text-green-700">@${this.botName}</span>`
        }
        return "Not connected"
      },

      get hasSavedToken() {
        return !!localStorage.getItem(STORAGE_KEY)
      },

      get shortcutHint() {
        return isMac ? "\u2318\u23CE" : "Ctrl+\u23CE"
      },

      // -- lifecycle --
      async init() {
        editor = await createEditor(document.getElementById("code-editor")!)
        worker = createWorkerManager()
        setupWorkerMessages(this)

        // Restore last active example
        currentExample = localStorage.getItem(ACTIVE_EXAMPLE_KEY) ?? "empty.ts"
        const savedCode = localStorage.getItem(CODE_STORAGE_PREFIX + currentExample)
        if (savedCode) {
          editor.model.setValue(savedCode)
        } else {
          const initialCode = await loadExample(currentExample)
          editor.model.setValue(initialCode)
        }

        // Auto-save on content changes
        editor.model.onDidChangeContent(() => scheduleSave(this))

        // Track editor errors reactively
        editor.onMarkerChange((count) => {
          this.errorCount = count
        })

        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) this._connectWithToken(saved)
      },

      // -- methods --
      async selectExample(name: string) {
        // Save current code before switching
        if (editor) {
          localStorage.setItem(CODE_STORAGE_PREFIX + currentExample, editor.model.getValue())
        }
        currentExample = name
        this.activeExample = name
        localStorage.setItem(ACTIVE_EXAMPLE_KEY, name)

        // Load saved version or fresh example
        const saved = localStorage.getItem(CODE_STORAGE_PREFIX + name)
        if (saved) {
          editor!.model.setValue(saved)
        } else {
          const code = await loadExample(name)
          editor!.model.setValue(code)
        }
        this._pushLog({
          text: `Switched to ${name}`,
          level: "info",
          isUpdate: false,
          isHandleResult: false,
          collapsed: false
        })
        if (this.isConnected) {
          this.runCurrentCode()
        }
      },

      async runCurrentCode() {
        // Cancel any pending auto-save restart to avoid double-starting
        if (saveTimer) {
          clearTimeout(saveTimer)
          saveTimer = null
        }
        const code = await editor!.getCompiledCode()
        if (code && this.token) {
          const wasRunning = this.botDot === "running"
          // Kill old worker to cancel in-flight polling requests (avoids 409 Conflict)
          if (wasRunning) {
            worker!.terminate()
            worker = createWorkerManager()
            setupWorkerMessages(this)
          }
          this.stats = { handled: 0, ignored: 0, noHandler: 0, errors: 0 }
          this.botDot = "running"
          worker!.runBot(code, this.token, "debug")
          if (wasRunning) {
            pendingRestart = true
            this._showToast("Bot restarted", "success")
          }
        }
      },

      runIfConnected() {
        if (this.isConnected) this.runCurrentCode()
      },

      toggleVerbose() {
        this.verbose = !this.verbose
      },

      stopBot() {
        worker!.terminate()
        worker = createWorkerManager()
        setupWorkerMessages(this)
        this.botDot = "idle"
        this._showToast("Bot stopped", "success")
      },

      // -- resizable panels --
      startDrag(e: MouseEvent) {
        e.preventDefault()
        this.isDragging = true
        const onMove = (ev: MouseEvent) => {
          const main = (this as any).$refs.mainContainer as HTMLElement
          if (!main) return
          const rect = main.getBoundingClientRect()
          const pct = ((ev.clientX - rect.left) / rect.width) * 100
          this.editorWidth = Math.max(25, Math.min(75, pct))
        }
        const onUp = () => {
          this.isDragging = false
          window.removeEventListener("mousemove", onMove)
          window.removeEventListener("mouseup", onUp)
        }
        window.addEventListener("mousemove", onMove)
        window.addEventListener("mouseup", onUp)
      },

      // -- toasts --
      _showToast(text: string, type: "success" | "error") {
        const id = toastCounter++
        this.toasts.push({ id, text, type, exiting: false })
        setTimeout(() => {
          const toast = this.toasts.find((t: ToastEntry) => t.id === id)
          if (toast) toast.exiting = true
          setTimeout(() => {
            this.toasts = this.toasts.filter((t: ToastEntry) => t.id !== id)
          }, 200)
        }, 2500)
      },

      // -- collapsible logs --
      toggleLog(index: number) {
        const log = this.filteredLogs[index]
        if (log && this._isCollapsible(log)) {
          log.collapsed = !log.collapsed
        }
      },

      _isCollapsible(log: LogEntry) {
        return log.text.split("\n").length > COLLAPSE_THRESHOLD
      },

      logDisplayText(log: LogEntry) {
        if (log.collapsed && this._isCollapsible(log)) {
          const firstLine = log.text.split("\n")[0]
          return firstLine + " ..."
        }
        return log.text
      },

      // -- token modal --
      submitToken() {
        const val = this.tokenModal.value.trim()
        if (!val) {
          this.tokenModal.error = "Token is required"
          return
        }
        this.tokenModal.open = false
        this.tokenModal._resolve?.(val)
      },

      cancelToken() {
        this.tokenModal.open = false
        this.tokenModal._resolve?.(null)
      },

      _showTokenModal(): Promise<string | null> {
        return new Promise((resolve) => {
          this.tokenModal.value = localStorage.getItem(STORAGE_KEY) ?? ""
          this.tokenModal.error = ""
          this.tokenModal._resolve = resolve
          this.tokenModal.open = true
          ;(this as any).$nextTick(() => {
            ;((this as any).$refs.tokenInput as HTMLInputElement)?.focus()
          })
        })
      },

      // -- confirm modal --
      resolveConfirm(val: boolean) {
        this.confirmModal.open = false
        this.confirmModal._resolve?.(val)
      },

      _showConfirmModal(description: string): Promise<boolean> {
        return new Promise((resolve) => {
          this.confirmModal.description = description
          this.confirmModal._resolve = resolve
          this.confirmModal.open = true
        })
      },

      // -- connection --
      async connectBot() {
        const token = await this._showTokenModal()
        if (!token) return
        await this._connectWithToken(token)
      },

      async _connectWithToken(token: string) {
        this.botDot = "idle"

        try {
          const [meRes, webhookRes] = await Promise.all([
            fetch(`https://api.telegram.org/bot${token}/getMe`).then((r) => r.json()),
            fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`).then((r) => r.json())
          ])

          if (!meRes.ok) {
            this._showToast("Invalid bot token", "error")
            this._resetConnection()
            return
          }

          const webhook = webhookRes.result
          if (webhook?.url) {
            this._addLog({
              webhook_url: webhook.url,
              pending_updates: webhook.pending_update_count ?? 0,
              ...(webhook.last_error_message ? { last_error: webhook.last_error_message } : {})
            })

            const shouldDelete = await this._showConfirmModal(
              `This bot has an active webhook:\n${webhook.url}\n` +
                `Pending updates: ${webhook.pending_update_count ?? 0}\n\n` +
                `Polling won't work while a webhook is set.`
            )

            if (!shouldDelete) {
              this._resetConnection()
              return
            }

            const deleteRes = await fetch(
              `https://api.telegram.org/bot${token}/deleteWebhook`
            ).then((r) => r.json())

            if (!deleteRes.ok) {
              this._showToast("Failed to delete webhook", "error")
              this._resetConnection()
              return
            }

            this._showToast("Webhook deleted", "success")
          }

          this.token = token
          this.botName = meRes.result.username ?? meRes.result.first_name
          this.isConnected = true
          localStorage.setItem(STORAGE_KEY, token)

          this.runCurrentCode()
        } catch (err) {
          this._showToast(`Connection failed: ${err}`, "error")
          this._resetConnection()
        }
      },

      forgetToken() {
        localStorage.removeItem(STORAGE_KEY)
        if (this.isConnected) this.stopBot()
        this._resetConnection()
      },

      _resetConnection() {
        this.isConnected = false
        this.token = ""
        this.botName = ""
        this.botDot = "idle"
      },

      _addLog(data: Record<string, unknown>) {
        const text = JSON.stringify(data, null, 2)
        const collapsed = text.split("\n").length > COLLAPSE_THRESHOLD
        this._pushLog({
          text,
          level: "error" in data ? "error" : "info",
          isUpdate: false,
          isHandleResult: false,
          collapsed
        })
      },

      _addUpdateLog(update: Record<string, unknown>) {
        const summary = formatUpdateSummary(update)
        this._pushLog({
          text: summary,
          level: "info",
          isUpdate: true,
          isHandleResult: false,
          collapsed: false
        })
      },

      _addHandleResultLog(data: Record<string, unknown>) {
        const status = data["status"] as string
        const updateType = data["updateType"] as string
        const duration = data["duration"] as number
        const responseType = data["responseType"] as string | undefined
        const error = data["error"] as string | undefined

        let text = `on_${updateType}`
        if (status === "handled") {
          text += ` → handled → ${responseType ?? "response"} ${duration}ms`
        } else if (status === "ignored") {
          text += ` → ignored ${duration}ms`
        } else if (status === "no_handler") {
          text += ` → no handler`
        } else if (status === "error") {
          text += ` → error: ${error} ${duration}ms`
        }

        // Update stats
        if (status === "handled") this.stats.handled++
        else if (status === "ignored") this.stats.ignored++
        else if (status === "no_handler") this.stats.noHandler++
        else if (status === "error") this.stats.errors++

        this._pushLog({
          text,
          level: status === "error" ? "error" : "info",
          isUpdate: false,
          isHandleResult: true,
          handleStatus: status as LogEntry["handleStatus"],
          collapsed: false
        })
      },

      _addConsoleLog(text: string, level: string) {
        const collapsed = text.split("\n").length > COLLAPSE_THRESHOLD
        this._pushLog({
          text,
          level: level as LogLevel,
          isUpdate: false,
          isHandleResult: false,
          collapsed
        })
      },

      _pushLog(entry: Omit<LogEntry, "time">) {
        const time = new Date().toLocaleTimeString("en-GB", { hour12: false })
        this.logs.push({ time, ...entry })
        ;(this as any).$nextTick(() => {
          const el = (this as any).$refs.logsContainer as HTMLElement
          if (el) el.scrollTop = el.scrollHeight
        })
      },

      logBorderClass(log: LogEntry) {
        if (log.isHandleResult) {
          if (log.handleStatus === "handled") return "border-green-400 text-green-700"
          if (log.handleStatus === "ignored") return "border-gray-300 text-gray-500"
          if (log.handleStatus === "no_handler") return "border-yellow-400 text-yellow-700"
          if (log.handleStatus === "error") return "border-red-400 text-red-700"
        }
        if (log.level === "error") return "border-red-400 text-red-700"
        if (log.level === "warn") return "border-yellow-400 text-yellow-700"
        if (log.isUpdate) return "border-blue-400"
        if (log.level === "debug") return "border-gray-200 text-gray-400"
        return "border-gray-300"
      }
    }
  })
}
