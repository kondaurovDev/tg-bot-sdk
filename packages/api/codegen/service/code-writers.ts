/**
 * @module code-writers
 *
 * TypeScript code generation services.
 *
 * Pure string-based emitter + prettier. No AST, no compiler dependency.
 * - {@link BotApiCodeWriterService} writes `types.ts` and `api.ts`
 *   (all Bot API interfaces and method signatures)
 * - {@link WebAppCodeWriterService} writes `webapp.ts`
 *   (Mini Apps WebApp interface and related types)
 */
import { Config, Effect, String } from "effect"
import { writeFile, mkdir } from "node:fs/promises"
import * as Path from "path"

import type { ExtractedMethodShape, ExtractedTypeShape } from "~/scrape/entity"
import { ExtractedWebApp } from "~/scrape/entities"
import {
  assembleFile,
  emitExtractedType,
  emitInterface,
  emitNamespaceImport,
  emitTypeAlias,
  formatTsSource
} from "./emitter"

// ── Shared ──

const writeTsFile = async (outPath: string, source: string) => {
  const formatted = await formatTsSource(source)
  await mkdir(Path.dirname(outPath), { recursive: true })
  await writeFile(outPath, formatted)
  console.log("Wrote", outPath)
}

const specPath = (outDir: string, fileName: string) =>
  Path.join(outDir, "src", "specification", `${fileName}.ts`)

// ── Doc site links ──

const SITE_BASE = "https://tg-bot-sdk.website"

const toKebab = (name: string): string =>
  String.snakeToKebab(String.camelToSnake(name)).replace(/^-/, "")

const typeDocUrl = (name: string) => `${SITE_BASE}/api/types/${toKebab(name)}/`
const methodDocUrl = (name: string) =>
  `${SITE_BASE}/api/methods/${toKebab(name)}/`

// ── Bot API types.ts ──

const TYPE_NAMESPACE = "T"

export const renderTypes = (types: ExtractedTypeShape[]): string => {
  const parts = [
    emitTypeAlias("AllowedUpdateName", `Exclude<keyof Update, "update_id">`),
    ...types.map((t) =>
      emitExtractedType(t, { seeUrl: typeDocUrl(t.typeName) })
    )
  ]
  return assembleFile(parts)
}

// ── Bot API api.ts ──

const makeMethodInputName = (methodName: string) =>
  `${String.snakeToPascal(methodName)}Input`

export const renderMethods = (methods: ExtractedMethodShape[]): string => {
  const apiInterface = emitInterface("Api", {
    methods: methods.map((m) => ({
      name: String.camelToSnake(m.methodName),
      returnType: m.returnType.getTsType(TYPE_NAMESPACE),
      parameters: [{ name: "_", type: makeMethodInputName(m.methodName) }],
      description: m.methodDescription,
      seeUrl: methodDocUrl(m.methodName)
    }))
  })

  const inputInterfaces = methods.map((m) =>
    emitInterface(makeMethodInputName(m.methodName), {
      description: m.methodDescription,
      seeUrl: methodDocUrl(m.methodName),
      properties:
        m.parameters?.fields.map((f) => ({
          name: f.name,
          type: f.type.getTsType(TYPE_NAMESPACE),
          optional: !f.required,
          description: f.description
        })) ?? []
    })
  )

  return assembleFile([
    emitNamespaceImport(TYPE_NAMESPACE, "./types"),
    apiInterface,
    ...inputInterfaces
  ])
}

// ── BotApiCodeWriterService ──

export class BotApiCodeWriterService extends Effect.Service<BotApiCodeWriterService>()(
  "BotApiCodeWriterService",
  {
    effect: Effect.gen(function* () {
      const outDirParts = yield* Config.array(
        Config.nonEmptyString(),
        "scrapper-out-dir"
      )
      const outDir = Path.join(...outDirParts)

      return {
        writeTypes: (types: ExtractedTypeShape[]) =>
          Effect.tryPromise(() =>
            writeTsFile(specPath(outDir, "types"), renderTypes(types))
          ),
        writeMethods: (methods: ExtractedMethodShape[]) =>
          Effect.tryPromise(() =>
            writeTsFile(specPath(outDir, "api"), renderMethods(methods))
          )
      } as const
    })
  }
) {}

// ── WebAppCodeWriterService ──

export const renderWebApp = (extractedWebApp: ExtractedWebApp): string =>
  assembleFile([
    emitNamespaceImport("T", "../event-handlers", true),
    emitInterface(
      "WebApp",
      extractedWebApp.fields.map((field) => ({
        name: field.name,
        type: field.type.getTsType()
      }))
    ),
    ...extractedWebApp.types.map((t) => emitExtractedType(t))
  ])

export class WebAppCodeWriterService extends Effect.Service<WebAppCodeWriterService>()(
  "WebAppCodeWriterService",
  {
    effect: Effect.gen(function* () {
      const outDirParts = yield* Config.array(
        Config.nonEmptyString(),
        "scrapper-out-dir"
      )
      const outDir = Path.join(...outDirParts)

      return {
        writeWebApp: (extractedWebApp: ExtractedWebApp) =>
          Effect.tryPromise(() =>
            writeTsFile(specPath(outDir, "webapp"), renderWebApp(extractedWebApp))
          )
      } as const
    })
  }
) {}
