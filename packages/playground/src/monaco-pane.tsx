/**
 * @module monaco-pane
 * The element Monaco lives in. The editor is created once, outside React's
 * state (its object graph is huge), and handed up through `onReady`.
 */
import { useEffect, useRef } from "react"

import { createCodeEditor, type CodeEditor } from "./monaco"

export interface MonacoPaneProps {
  onReady(editor: CodeEditor): void
}

export const MonacoPane = ({ onReady }: MonacoPaneProps) => {
  const container = useRef<HTMLDivElement>(null)
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady

  useEffect(() => {
    const el = container.current
    if (!el) return
    let disposed = false
    let created: CodeEditor | undefined
    void createCodeEditor(el).then((editor) => {
      if (disposed) {
        editor.dispose()
        return
      }
      created = editor
      onReadyRef.current(editor)
    })
    return () => {
      disposed = true
      created?.dispose()
    }
  }, [])

  return <div ref={container} className="pg-monaco" data-testid="editor" />
}
