/**
 * Root Alpine component of the playground. Owns the editor and worker
 * lifecycle, the emulator/real mode switch, and the real-bot connection;
 * chat, logs, toasts, and modals live in their own slices.
 */
import { createEditor, loadExample, type PlaygroundEditor } from "./editor"
import { createWorkerManager, type WorkerManager } from "./worker-manager"
import type { PlaygroundMode, WorkerCommand, WorkerEvent } from "./protocol"
import { chatMethods, chatState } from "./chat"
import { logsMethods, logsState, type LogEntry } from "./logs"
import { modalsMethods, modalsState } from "./modals"
import { toastsMethods, toastsState } from "./toasts"

type BotDot = "idle" | "running" | "error"

const TOKEN_STORAGE_KEY = "playground_bot_token"
const CODE_STORAGE_PREFIX = "playground_code:"
const ACTIVE_EXAMPLE_KEY = "playground_active_example"
const MODE_STORAGE_KEY = "playground_mode"

const dotClasses: Record<BotDot, string> = {
  idle: "bg-gray-300",
  running: "bg-green-500 dot-pulse",
  error: "bg-red-500"
}

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent)

export interface ExampleInfo {
  file: string
  label: string
  group: string
  hint: string
}

const EXAMPLES: ExampleInfo[] = [
  { file: "empty.ts", label: "Hello, world", group: "Basics", hint: "The smallest possible bot" },
  {
    file: "echo.ts",
    label: "Echo & reactions",
    group: "Basics",
    hint: "Multiple actions per handler, message reactions"
  },
  {
    file: "command.ts",
    label: "Commands",
    group: "Basics",
    hint: "Guarded handlers, HTML parse mode"
  },
  {
    file: "screens.ts",
    label: "Screens: menu",
    group: "UI & navigation",
    hint: "defineScreens — inline-keyboard navigation as data"
  },
  {
    file: "rich.ts",
    label: "Rich messages",
    group: "UI & navigation",
    hint: "Blocks: headings, tables, code, styled buttons"
  },
  {
    file: "stream.ts",
    label: "Streaming replies",
    group: "AI",
    hint: "ctx.stream — live drafts like an LLM bot"
  },
  {
    file: "file.ts",
    label: "Files",
    group: "Media & fun",
    hint: "Documents both ways, getFile round-trip"
  },
  {
    file: "dice.ts",
    label: "Dice casino",
    group: "Media & fun",
    hint: "Chat actions, dice, callback buttons"
  }
]

const savedMode = (): PlaygroundMode =>
  localStorage.getItem(MODE_STORAGE_KEY) === "real" ? "real" : "virtual"

export function registerPlayground(Alpine: import("alpinejs").Alpine) {
  Alpine.data("playground", () => {
    // Closure variables — NOT wrapped in Alpine's reactive proxy.
    // Monaco editor and Web Worker have huge internal object graphs
    // that would freeze the page if proxied.
    let editor: PlaygroundEditor | null = null
    let worker: WorkerManager | null = null
    let saveTimer: ReturnType<typeof setTimeout> | null = null
    let pendingRestart = false
    let currentExample = "empty.ts"

    function attachWorker(self: any) {
      worker = createWorkerManager()
      worker.onEvent((event) => self._handleWorkerEvent(event))
    }

    function scheduleSave(self: any) {
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(async () => {
        if (!editor) return
        localStorage.setItem(CODE_STORAGE_PREFIX + currentExample, editor.model.getValue())

        // Restart the bot when the code compiles: in the emulator the bot
        // is always kept alive (even after an error), in real mode only
        // while it is connected and running.
        const shouldRestart =
          self.mode === "virtual" ? true : self.isConnected && self.botDot === "running"
        if (shouldRestart) {
          const errors = await editor.hasErrors()
          if (!errors) {
            self.runCurrentCode()
          }
        }
      }, 1500)
    }

    return {
      ...logsState(),
      ...toastsState(),
      ...modalsState(),
      ...chatState(),

      // -- reactive state --
      mode: savedMode(),
      token: "",
      botName: "",
      isConnected: false,
      botDot: "idle" as BotDot,
      botBusy: false,
      logsOpen: savedMode() === "real",
      errorCount: 0,
      editorWidth: 60,
      isDragging: false,
      activeExample: localStorage.getItem(ACTIVE_EXAMPLE_KEY) ?? "empty.ts",
      pickerOpen: false,
      pickerQuery: "",

      // -- computed --
      get filteredLogs() {
        if (this.verbose) return this.logs
        return this.logs.filter((l: LogEntry) => l.level !== "debug")
      },

      get canRun() {
        return this.mode === "virtual" || this.isConnected
      },

      get dotClass() {
        return dotClasses[this.botDot as BotDot]
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
        return !!localStorage.getItem(TOKEN_STORAGE_KEY)
      },

      get shortcutHint() {
        return isMac ? "⌘⏎" : "Ctrl+⏎"
      },

      get currentExampleLabel() {
        return EXAMPLES.find((e) => e.file === this.activeExample)?.label ?? this.activeExample
      },

      get filteredExampleGroups() {
        const query = this.pickerQuery.trim().toLowerCase()
        const matches = query
          ? EXAMPLES.filter((e) => `${e.label} ${e.hint} ${e.group}`.toLowerCase().includes(query))
          : EXAMPLES
        const groups: { group: string; items: ExampleInfo[] }[] = []
        for (const example of matches) {
          const bucket = groups.find((g) => g.group === example.group)
          if (bucket) bucket.items.push(example)
          else groups.push({ group: example.group, items: [example] })
        }
        return groups
      },

      openPicker() {
        this.pickerOpen = true
        this.pickerQuery = ""
        ;(this as any).$nextTick(() => {
          ;((this as any).$refs.pickerSearch as HTMLInputElement | undefined)?.focus()
        })
      },

      pickExample(file: string) {
        this.pickerOpen = false
        if (file !== this.activeExample) this.selectExample(file)
      },

      get phoneTime() {
        return new Date().toLocaleTimeString("en-GB", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit"
        })
      },

      // -- lifecycle --
      async init() {
        editor = await createEditor(document.getElementById("code-editor")!)
        attachWorker(this)

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

        if (this.mode === "virtual") {
          this.runCurrentCode()
        } else {
          const saved = localStorage.getItem(TOKEN_STORAGE_KEY)
          if (saved) this._connectWithToken(saved)
        }
      },

      // -- mode --
      setMode(mode: PlaygroundMode) {
        if (this.mode === mode) return
        this.mode = mode
        localStorage.setItem(MODE_STORAGE_KEY, mode)
        this.logsOpen = mode === "real"
        this.stopBot()
        if (mode === "virtual") {
          this.runCurrentCode()
        } else {
          const saved = localStorage.getItem(TOKEN_STORAGE_KEY)
          if (saved && !this.isConnected) this._connectWithToken(saved)
        }
      },

      // -- examples --
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
        if (this.canRun) {
          this.runCurrentCode()
        }
      },

      // -- run / stop --
      async runCurrentCode() {
        // Cancel any pending auto-save restart to avoid double-starting
        if (saveTimer) {
          clearTimeout(saveTimer)
          saveTimer = null
        }
        const code = await editor!.getCompiledCode()
        if (!code) return
        if (this.mode === "real" && !this.token) return

        const wasRunning = this.botDot === "running"
        // Kill the old worker to cancel in-flight polling requests
        // (avoids 409 Conflict in real mode, resets the emulator in virtual)
        if (wasRunning) {
          worker!.terminate()
          attachWorker(this)
        }
        this.stats = { handled: 0, ignored: 0, noHandler: 0, errors: 0 }
        this.chatMessages = []
        this.chatDraft = null
        this.chatReactions = {}
        this.botBusy = false
        this.botDot = "running"
        worker!.send({
          command: "run-bot",
          mode: this.mode,
          code,
          ...(this.mode === "real" ? { token: this.token } : {}),
          logLevel: "debug"
        })
        if (wasRunning) {
          pendingRestart = true
          // Auto-restarts are the norm in the emulator — don't toast them
          if (this.mode === "real") this._showToast("Bot restarted", "success")
        }
      },

      runIfReady() {
        if (this.canRun) this.runCurrentCode()
      },

      stopBot() {
        worker!.terminate()
        attachWorker(this)
        this.botDot = "idle"
        this.botBusy = false
        this._showToast("Bot stopped", "success")
      },

      // -- worker events --
      _sendToWorker(command: WorkerCommand) {
        worker!.send(command)
      },

      _handleWorkerEvent(event: WorkerEvent) {
        switch (event.type) {
          case "bot-state":
            if (event.state === "active") this.botDot = "running"
            else this.botDot = "idle"
            if (event.notice) {
              // Suppress "Bot started" toast when we already showed "Bot restarted"
              if (pendingRestart) {
                pendingRestart = false
              } else {
                this._showToast(event.notice, "success")
              }
            }
            break
          case "log":
            this._addConsoleLog(event.text, event.level)
            break
          case "update":
            this._addUpdateLog(event.update as unknown as Record<string, unknown>)
            break
          case "handle-result":
            this.botBusy = false
            this._addHandleResultLog(event)
            break
          case "chat-event":
            this.applyChatEvent(event.event)
            break
          case "error":
            pendingRestart = false
            this.botDot = "error"
            this.botBusy = false
            this.logsOpen = true
            this._showToast(event.error, "error")
            break
        }
      },

      // -- real bot connection --
      async connectBot() {
        const token = await this._showTokenModal(localStorage.getItem(TOKEN_STORAGE_KEY) ?? "")
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
          localStorage.setItem(TOKEN_STORAGE_KEY, token)

          this.runCurrentCode()
        } catch (err) {
          this._showToast(`Connection failed: ${err}`, "error")
          this._resetConnection()
        }
      },

      forgetToken() {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        if (this.isConnected) this.stopBot()
        this._resetConnection()
      },

      _resetConnection() {
        this.isConnected = false
        this.token = ""
        this.botName = ""
        this.botDot = "idle"
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

      // -- slices --
      ...logsMethods,
      ...toastsMethods,
      ...modalsMethods,
      ...chatMethods
    }
  })
}
