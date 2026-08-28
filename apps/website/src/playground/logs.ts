/**
 * Logs panel slice of the playground component: log entries, per-run
 * stats, and formatting helpers. Merged into the root Alpine component.
 */
import type { HandleStatus, LogLevel, WorkerEvent } from "./protocol"

export interface LogEntry {
  time: string
  text: string
  level: LogLevel
  isUpdate: boolean
  isHandleResult: boolean
  handleStatus?: HandleStatus
  collapsed: boolean
}

export interface RunStats {
  handled: number
  ignored: number
  noHandler: number
  errors: number
}

const COLLAPSE_THRESHOLD = 3

export function formatUpdateSummary(update: Record<string, unknown>): string {
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

export const logsState = () => ({
  logs: [] as LogEntry[],
  stats: { handled: 0, ignored: 0, noHandler: 0, errors: 0 } as RunStats,
  verbose: false
})

export const logsMethods = {
  toggleVerbose(this: any) {
    this.verbose = !this.verbose
  },

  toggleLog(this: any, index: number) {
    const log = this.filteredLogs[index]
    if (log && this._isCollapsible(log)) {
      log.collapsed = !log.collapsed
    }
  },

  _isCollapsible(this: any, log: LogEntry) {
    return log.text.split("\n").length > COLLAPSE_THRESHOLD
  },

  logDisplayText(this: any, log: LogEntry) {
    if (log.collapsed && this._isCollapsible(log)) {
      const firstLine = log.text.split("\n")[0]
      return firstLine + " ..."
    }
    return log.text
  },

  logBorderClass(this: any, log: LogEntry) {
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
  },

  _addLog(this: any, data: Record<string, unknown>) {
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

  _addUpdateLog(this: any, update: Record<string, unknown>) {
    this._pushLog({
      text: formatUpdateSummary(update),
      level: "info",
      isUpdate: true,
      isHandleResult: false,
      collapsed: false
    })
  },

  _addHandleResultLog(this: any, data: Extract<WorkerEvent, { type: "handle-result" }>) {
    const { status, updateType, duration, responseType, error } = data

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

    if (status === "handled") this.stats.handled++
    else if (status === "ignored") this.stats.ignored++
    else if (status === "no_handler") this.stats.noHandler++
    else if (status === "error") this.stats.errors++

    this._pushLog({
      text,
      level: status === "error" ? "error" : "info",
      isUpdate: false,
      isHandleResult: true,
      handleStatus: status,
      collapsed: false
    })
  },

  _addConsoleLog(this: any, text: string, level: LogLevel) {
    const collapsed = text.split("\n").length > COLLAPSE_THRESHOLD
    this._pushLog({
      text,
      level,
      isUpdate: false,
      isHandleResult: false,
      collapsed
    })
  },

  _pushLog(this: any, entry: Omit<LogEntry, "time">) {
    const time = new Date().toLocaleTimeString("en-GB", { hour12: false })
    this.logs.push({ time, ...entry })
    this.$nextTick(() => {
      const el = this.$refs.logsContainer as HTMLElement | undefined
      if (el) el.scrollTop = el.scrollHeight
    })
  }
}
