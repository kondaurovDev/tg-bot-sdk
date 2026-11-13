/**
 * @module logs
 * The console's entries and the per-run counters, folded from worker
 * events by a reducer.
 */
import type { Update } from "@effect-ak/tg-bot-api"

import type { HandleStatus, LogLevel, WorkerEvent } from "./protocol"

export interface LogEntry {
  id: number
  time: string
  text: string
  level: LogLevel
  kind: "console" | "update" | "result"
  status?: HandleStatus
}

export interface RunStats {
  handled: number
  ignored: number
  noHandler: number
  errors: number
}

export interface LogsState {
  entries: readonly LogEntry[]
  stats: RunStats
}

// Enough for a session; older entries drop off the top
const MAX_ENTRIES = 500

export const emptyStats: RunStats = { handled: 0, ignored: 0, noHandler: 0, errors: 0 }
export const initialLogs: LogsState = { entries: [], stats: emptyStats }

/** A one-line summary of an update for the console. */
export const describeUpdate = (update: Update): string => {
  const message = update.message
  if (message) {
    const name = message.from?.username ?? message.from?.first_name ?? "unknown"
    if (message.text) return `@${name}: ${message.text}`
    if (message.photo) return `@${name} sent a photo`
    if (message.document) return `@${name} sent a document`
    if (message.sticker) return `@${name} sent a sticker`
    if (message.voice) return `@${name} sent a voice message`
    if (message.video) return `@${name} sent a video`
    return `@${name} sent a message`
  }
  const callback = update.callback_query
  if (callback) {
    const name = callback.from.username ?? callback.from.first_name
    return `@${name} callback: ${callback.data ?? ""}`
  }
  const type = Object.keys(update).find((key) => key !== "update_id") ?? "unknown"
  return `${type} #${update.update_id}`
}

const describeResult = (event: Extract<WorkerEvent, { type: "handle-result" }>): string => {
  const head = `on_${event.updateType}`
  switch (event.status) {
    case "handled":
      return `${head} → handled → ${event.responseType ?? "response"} ${event.duration}ms`
    case "ignored":
      return `${head} → ignored ${event.duration}ms`
    case "no_handler":
      return `${head} → no handler`
    case "error":
      return `${head} → error: ${event.error ?? "unknown"} ${event.duration}ms`
  }
}

const countKey: Record<HandleStatus, keyof RunStats> = {
  handled: "handled",
  ignored: "ignored",
  no_handler: "noHandler",
  error: "errors"
}

export type LogsAction =
  | { type: "event"; event: WorkerEvent }
  | { type: "note"; text: string; level: LogLevel }
  | { type: "clear" }
  | { type: "new-run" }

let nextId = 0

const push = (state: LogsState, entry: Omit<LogEntry, "id" | "time">, stats = state.stats) => ({
  stats,
  entries: [
    ...state.entries.slice(-(MAX_ENTRIES - 1)),
    {
      ...entry,
      id: nextId++,
      time: new Date().toLocaleTimeString("en-GB", { hour12: false })
    }
  ]
})

export const logsReducer = (state: LogsState, action: LogsAction): LogsState => {
  switch (action.type) {
    case "clear":
      return { ...state, entries: [] }
    case "new-run":
      return { ...state, stats: emptyStats }
    case "note":
      return push(state, { text: action.text, level: action.level, kind: "console" })
    case "event": {
      const event = action.event
      switch (event.type) {
        case "log":
          return push(state, { text: event.text, level: event.level, kind: "console" })
        case "update":
          return push(state, { text: describeUpdate(event.update), level: "info", kind: "update" })
        case "handle-result": {
          const key = countKey[event.status]
          return push(
            state,
            {
              text: describeResult(event),
              level: event.status === "error" ? "error" : "info",
              kind: "result",
              status: event.status
            },
            { ...state.stats, [key]: state.stats[key] + 1 }
          )
        }
        case "action-error":
          return push(
            state,
            { text: event.error, level: "error", kind: "console" },
            { ...state.stats, errors: state.stats.errors + 1 }
          )
        case "error":
          return push(state, { text: event.error, level: "error", kind: "console" })
        default:
          return state
      }
    }
  }
}
