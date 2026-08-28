import type { editor, languages } from "monaco-editor"

// Vite imports .d.ts as raw strings at build time
import botTypes from "@effect-ak/tg-bot/dist/index.d.ts?raw"
import apiTypes from "@effect-ak/tg-bot-api/dist/index.d.ts?raw"
import clientTypes from "@effect-ak/tg-bot-client/dist/index.d.ts?raw"

type Monaco = typeof import("monaco-editor")

function declareModule(name: string, dts: string): string {
  return `declare module "${name}" {\n${dts}\n}`
}

export interface PlaygroundEditor {
  monaco: Monaco
  editor: editor.IStandaloneCodeEditor
  model: editor.ITextModel
  getCompiledCode(): Promise<string | null>
  hasErrors(): Promise<boolean>
  onMarkerChange(cb: (errorCount: number) => void): void
  dispose(): void
}

export async function createEditor(container: HTMLElement): Promise<PlaygroundEditor> {
  const { default: loader } = await import("@monaco-editor/loader")

  loader.config({
    paths: {
      vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.54.0/min/vs"
    }
  })

  const monaco: Monaco = await loader.init()

  const tsDefaults = monaco.languages.typescript.typescriptDefaults
  tsDefaults.setCompilerOptions({
    ...tsDefaults.getCompilerOptions(),
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    strict: true,
    skipLibCheck: true
  })

  tsDefaults.addExtraLib(declareModule("@effect-ak/tg-bot-api", apiTypes))
  tsDefaults.addExtraLib(declareModule("@effect-ak/tg-bot-client", clientTypes))
  tsDefaults.addExtraLib(declareModule("@effect-ak/tg-bot", botTypes))

  const model = monaco.editor.createModel("", "typescript")
  const ed = monaco.editor.create(container, {
    model,
    minimap: { enabled: false },
    automaticLayout: true,
    contextmenu: false,
    fontSize: 14,
    scrollBeyondLastLine: false,
    padding: { top: 8, bottom: 8 }
  })

  let tsWorker: languages.typescript.TypeScriptWorker

  return {
    monaco,
    editor: ed,
    model,
    async getCompiledCode() {
      if (!tsWorker) {
        const getWorker = await monaco.languages.typescript.getTypeScriptWorker()
        tsWorker = await getWorker(model.uri)
      }
      const output = await tsWorker.getEmitOutput(model.uri.toString())
      return output.outputFiles[0]?.text ?? null
    },
    async hasErrors() {
      if (!tsWorker) {
        const getWorker = await monaco.languages.typescript.getTypeScriptWorker()
        tsWorker = await getWorker(model.uri)
      }
      const uri = model.uri.toString()
      const [syntactic, semantic] = await Promise.all([
        tsWorker.getSyntacticDiagnostics(uri),
        tsWorker.getSemanticDiagnostics(uri)
      ])
      return syntactic.length > 0 || semantic.length > 0
    },
    onMarkerChange(cb) {
      monaco.editor.onDidChangeMarkers(([resource]) => {
        if (resource.toString() !== model.uri.toString()) return
        const markers = monaco.editor.getModelMarkers({ resource: model.uri })
        const errorCount = markers.filter((m) => m.severity === monaco.MarkerSeverity.Error).length
        cb(errorCount)
      })
    },
    dispose() {
      ed.dispose()
      model.dispose()
    }
  }
}

export async function loadExample(name: string): Promise<string> {
  return fetch(`/bots/${name}`).then((r) => r.text())
}
