/**
 * @module example-picker
 * The searchable list of examples, grouped. A press outside closes it.
 */
import { useEffect, useRef, useState } from "react"

import { EXAMPLES, findExample, type Example } from "./examples"

export interface ExamplePickerProps {
  active: string
  onPick(file: string): void
}

const groupsOf = (examples: readonly Example[]) => {
  const groups: { group: string; items: Example[] }[] = []
  for (const example of examples) {
    const bucket = groups.find((g) => g.group === example.group)
    if (bucket) bucket.items.push(example)
    else groups.push({ group: example.group, items: [example] })
  }
  return groups
}

export const ExamplePicker = ({ active, onPick }: ExamplePickerProps) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const wrapper = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    // pointerdown, not click: iOS sends no click for a tap on a plain area
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

  const needle = query.trim().toLowerCase()
  const groups = groupsOf(
    needle
      ? EXAMPLES.filter((e) => `${e.label} ${e.hint} ${e.group}`.toLowerCase().includes(needle))
      : EXAMPLES
  )

  return (
    <div ref={wrapper} className="pg-picker">
      <button
        type="button"
        className="pg-picker-button"
        data-testid="example-picker"
        data-example={active}
        onClick={() => {
          setQuery("")
          setOpen(!open)
        }}
      >
        <span>{findExample(active)?.label ?? active}</span>
        <span className={`pg-picker-caret${open ? " pg-open" : ""}`}>▼</span>
      </button>
      {open && (
        <div className="pg-picker-panel">
          <input
            className="pg-picker-search"
            data-testid="example-search"
            type="text"
            placeholder="Search examples…"
            autoComplete="off"
            spellCheck={false}
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="pg-picker-list">
            {groups.map(({ group, items }) => (
              <div key={group}>
                <div className="pg-picker-group">{group}</div>
                {items.map((example) => (
                  <button
                    key={example.file}
                    type="button"
                    className={`pg-picker-option${example.file === active ? " pg-active" : ""}`}
                    data-testid="example-option"
                    data-example={example.file}
                    onClick={() => {
                      setOpen(false)
                      if (example.file !== active) onPick(example.file)
                    }}
                  >
                    <span className="pg-picker-label">{example.label}</span>
                    <span className="pg-picker-hint">{example.hint}</span>
                  </button>
                ))}
              </div>
            ))}
            {groups.length === 0 && <div className="pg-picker-empty">Nothing found</div>}
          </div>
        </div>
      )}
    </div>
  )
}
