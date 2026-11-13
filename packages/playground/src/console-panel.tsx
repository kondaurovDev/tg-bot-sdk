/**
 * @module console-panel
 * The console: a status strip with the run's counters, and a drawer of
 * log entries above it. Long entries start collapsed to their first line.
 */
import { useEffect, useRef, useState } from "react"

import type { LogEntry, LogsState } from "./logs"

// Entries longer than this many lines start collapsed
const COLLAPSE_LINES = 3

const entryClass = (entry: LogEntry): string => {
  if (entry.kind === "result") return `pg-log-${entry.status ?? "handled"}`
  if (entry.level === "error") return "pg-log-error"
  if (entry.level === "warn") return "pg-log-warn"
  if (entry.kind === "update") return "pg-log-update"
  if (entry.level === "debug") return "pg-log-debug"
  return ""
}

export interface ConsolePanelProps {
  logs: LogsState
  open: boolean
  onToggle(): void
  onClear(): void
}

export const ConsolePanel = ({ logs, open, onToggle, onClear }: ConsolePanelProps) => {
  const [verbose, setVerbose] = useState(false)
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(new Set())
  const list = useRef<HTMLDivElement>(null)
  const entries = verbose ? logs.entries : logs.entries.filter((e) => e.level !== "debug")
  const { stats } = logs

  useEffect(() => {
    const el = list.current
    if (el) el.scrollTop = el.scrollHeight
  }, [entries.length, open])

  const toggle = (id: number) =>
    setExpanded((all) => {
      const next = new Set(all)
      if (!next.delete(id)) next.add(id)
      return next
    })

  return (
    <div className="pg-console">
      {open && (
        <div className="pg-console-drawer">
          <div className="pg-console-tools">
            <button
              type="button"
              className={`pg-console-tool${verbose ? " pg-active" : ""}`}
              onClick={() => setVerbose(!verbose)}
            >
              Verbose
            </button>
            <button type="button" className="pg-console-tool" onClick={onClear}>
              Clear
            </button>
          </div>
          <div ref={list} className="pg-console-list" data-testid="console-logs">
            {entries.map((entry) => {
              const lines = entry.text.split("\n")
              const collapsible = lines.length > COLLAPSE_LINES
              const collapsed = collapsible && !expanded.has(entry.id)
              return (
                <div
                  key={entry.id}
                  className={`pg-log ${entryClass(entry)}${collapsible ? " pg-log-collapsible" : ""}`}
                  data-testid="console-log"
                  data-level={entry.level}
                  onClick={collapsible ? () => toggle(entry.id) : undefined}
                >
                  <span className="pg-log-time">{entry.time} </span>
                  {collapsible && <span className="pg-log-time">{collapsed ? "▶ " : "▼ "}</span>}
                  <span>{collapsed ? `${lines[0] ?? ""} ...` : entry.text}</span>
                </div>
              )
            })}
            {entries.length === 0 && <div className="pg-console-empty">No logs yet</div>}
          </div>
        </div>
      )}
      <button
        type="button"
        className="pg-console-strip"
        data-testid="console-toggle"
        data-errors={stats.errors}
        onClick={onToggle}
      >
        <span className="pg-console-title">
          <span className={`pg-console-caret${open ? " pg-open" : ""}`}>▲</span>
          Console
          {entries.length > 0 && <span className="pg-console-count">({entries.length})</span>}
        </span>
        <span className="pg-stat-handled">handled {stats.handled}</span>
        <span className="pg-stat-ignored pg-wide-only">ignored {stats.ignored}</span>
        <span className="pg-stat-no-handler pg-wide-only">no handler {stats.noHandler}</span>
        <span className={stats.errors > 0 ? "pg-stat-errors" : "pg-stat-zero"}>
          errors {stats.errors}
        </span>
      </button>
    </div>
  )
}
