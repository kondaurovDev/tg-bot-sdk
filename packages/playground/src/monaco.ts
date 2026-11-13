/**
 * @module monaco
 * The code editor: Monaco from the CDN, the SDK's own type declarations
 * for completions and errors, and the TypeScript worker that compiles the
 * bot to JavaScript for the bot worker.
 */
import type * as MonacoApi from "monaco-editor"
import type { editor, languages } from "monaco-editor"

// Vite imports the built declarations as strings
import botTypes from "@effect-ak/tg-bot/dist/index.d.ts?raw"
import apiTypes from "@effect-ak/tg-bot-api/dist/index.d.ts?raw"
import clientTypes from "@effect-ak/tg-bot-client/dist/index.d.ts?raw"

type Monaco = typeof MonacoApi

const MONACO_CDN = "https://cdn.jsdelivr.net/npm/monaco-editor@0.54.0/min/vs"

const declareModule = (name: string, dts: string) => `declare module "${name}" {\n${dts}\n}`

export interface CodeEditor {
  monaco: Monaco
  model: editor.ITextModel
  /** The bot compiled to JavaScript; `null` when the compiler gives nothing. */
  compile(): Promise<string | null>
  hasErrors(): Promise<boolean>
  /** Called with the number of errors whenever the markers change. */
  onErrorCount(listener: (count: number) => void): void
  /** Put the cursor on the first error; `false` when there is none. */
  revealFirstError(): boolean
  dispose(): void
}

export const createCodeEditor = async (container: HTMLElement): Promise<CodeEditor> => {
  const { default: loader } = await import("@monaco-editor/loader")
  loader.config({ paths: { vs: MONACO_CDN } })
  const monaco: Monaco = await loader.init()

  const ts = monaco.languages.typescript
  ts.typescriptDefaults.setCompilerOptions({
    ...ts.typescriptDefaults.getCompilerOptions(),
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    strict: true,
    skipLibCheck: true
  })
  ts.typescriptDefaults.addExtraLib(declareModule("@effect-ak/tg-bot-api", apiTypes))
  ts.typescriptDefaults.addExtraLib(declareModule("@effect-ak/tg-bot-client", clientTypes))
  ts.typescriptDefaults.addExtraLib(declareModule("@effect-ak/tg-bot", botTypes))

  const model = monaco.editor.createModel("", "typescript")
  const view = monaco.editor.create(container, {
    model,
    minimap: { enabled: false },
    automaticLayout: true,
    contextmenu: false,
    fontSize: 14,
    scrollBeyondLastLine: false,
    padding: { top: 8, bottom: 8 },
    // The examples use typographic dashes and quotes on purpose
    unicodeHighlight: { ambiguousCharacters: false }
  })

  let worker: languages.typescript.TypeScriptWorker | undefined
  const tsWorker = async () => {
    if (!worker) {
      const getWorker = await ts.getTypeScriptWorker()
      worker = await getWorker(model.uri)
    }
    return worker
  }

  return {
    monaco,
    model,
    async compile() {
      const output = await (await tsWorker()).getEmitOutput(model.uri.toString())
      return output.outputFiles[0]?.text ?? null
    },
    async hasErrors() {
      const uri = model.uri.toString()
      const w = await tsWorker()
      const [syntactic, semantic] = await Promise.all([
        w.getSyntacticDiagnostics(uri),
        w.getSemanticDiagnostics(uri)
      ])
      return syntactic.length > 0 || semantic.length > 0
    },
    onErrorCount(listener) {
      monaco.editor.onDidChangeMarkers((resources) => {
        if (!resources.some((resource) => resource.toString() === model.uri.toString())) return
        const markers = monaco.editor.getModelMarkers({ resource: model.uri })
        listener(markers.filter((m) => m.severity === monaco.MarkerSeverity.Error).length)
      })
    },
    revealFirstError() {
      const [first] = monaco.editor
        .getModelMarkers({ resource: model.uri })
        .filter((m) => m.severity === monaco.MarkerSeverity.Error)
        .sort((a, b) => a.startLineNumber - b.startLineNumber || a.startColumn - b.startColumn)
      if (!first) return false
      view.setPosition({ lineNumber: first.startLineNumber, column: first.startColumn })
      view.revealLineInCenter(first.startLineNumber)
      view.focus()
      return true
    },
    dispose() {
      view.dispose()
      model.dispose()
    }
  }
}
