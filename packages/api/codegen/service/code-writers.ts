/**
 * @module code-writers
 *
 * TypeScript code generation services.
 *
 * Uses ts-morph to programmatically create `.ts` source files:
 * - {@link BotApiCodeWriterService} writes `types.ts` and `api.ts`
 *   (all Bot API interfaces and method signatures)
 * - {@link WebAppCodeWriterService} writes `webapp.ts`
 *   (Mini Apps WebApp interface and related types)
 * - {@link TsMorpthWriter} manages the ts-morph Project instance
 */
import { Config, Effect, Either, pipe, String } from "effect"
import * as Path from "path"
import * as TsMorph from "ts-morph"
import type {
  MethodSignatureStructure,
  PropertySignatureStructure
} from "ts-morph"

import type { TsSourceFile } from "~/types"
import type { ExtractedMethodShape } from "~/scrape/entity"
import type { ExtractedTypeShape } from "~/scrape/entity"
import { ExtractedWebApp } from "~/scrape/entities"

// ── TsMorpthWriter ──

export class TsMorpthWriter extends Effect.Service<TsMorpthWriter>()(
  "TsMorpthWriter",
  {
    scoped: Effect.gen(function* () {
      const writeToDir = yield* Config.array(
        Config.nonEmptyString(),
        "scrapper-out-dir"
      )

      yield* Effect.logInfo("Initializing TsMorphWriter")

      yield* Effect.addFinalizer(() => Effect.logInfo("Closing TsMorpthWriter"))

      const project = new TsMorph.Project({
        manipulationSettings: {
          indentationText: TsMorph.IndentationText.TwoSpaces
        }
      })

      const saveFiles = pipe(
        Effect.tryPromise(() => project.save()),
        Effect.andThen((result) =>
          Effect.logInfo("Morph project closed", result)
        )
      )

      const createTsFile = (name: string, ...dir: string[]) =>
        Either.try(() => {
          const to = Path.join(...writeToDir, ...dir, name + ".ts")
          console.log("Creating morph source file", to)
          return project.createSourceFile(to, "", { overwrite: true })
        })

      return { createTsFile, saveFiles }
    }),
    dependencies: []
  }
) {}

// ── Shared type/interface writer ──

const addTypeOrInterface = (
  src: TsSourceFile,
  type: ExtractedTypeShape,
  typeNamespace?: string
) => {
  if (type.type._tag == "EntityFields") {
    return src.addInterface({
      name: type.typeName,
      isExported: true,
      properties: type.type.fields.map(
        (field) =>
          ({
            name: field.name,
            type: field.type.getTsType(typeNamespace),
            hasQuestionToken: !field.required
          }) as PropertySignatureStructure
      )
    })
  } else {
    return src.addTypeAlias({
      name: type.typeName,
      isExported: true,
      type: type.type.getTsType(typeNamespace)
    })
  }
}

// ── writeTypes ──

const writeTypes =
  (src: TsSourceFile) => (types: ExtractedTypeShape[]) => {
    src.addStatements("// GENERATED CODE ")

    src.addTypeAlias({
      name: "AllowedUpdateName",
      type: `Exclude<keyof Update, "update_id">`,
      isExported: true
    })

    for (const type of types) {
      addTypeOrInterface(src, type)
    }
  }

// ── writeMethods ──

const writeMethods =
  (src: TsSourceFile) => (methods: ExtractedMethodShape[]) => {
    src.addStatements("// GENERATED CODE ")

    const makeMethodInterfaceInputName = (_: string) =>
      `${String.snakeToPascal(_)}Input`

    const typeNamespace = "T"

    src.addImportDeclaration({
      moduleSpecifier: "./types",
      namespaceImport: typeNamespace
    })

    src
      .addInterface({
        name: "Api",
        isExported: true,
        methods: methods.map(
          (method) =>
            ({
              name: String.camelToSnake(method.methodName),
              returnType: method.returnType.getTsType(typeNamespace),
              parameters: [
                {
                  name: "_",
                  type: makeMethodInterfaceInputName(method.methodName)
                }
              ]
            }) as MethodSignatureStructure
        )
      })
      .formatText()

    for (const method of methods) {
      const interfaceName = makeMethodInterfaceInputName(method.methodName)

      src
        .addInterface({
          name: interfaceName,
          isExported: true,
          ...(method.parameters == null
            ? undefined
            : {
                properties: method.parameters.fields.map(
                  (field) =>
                    ({
                      name: field.name,
                      type: field.type.getTsType(typeNamespace),
                      hasQuestionToken: !field.required
                    }) as PropertySignatureStructure
                )
              })
        })
        .formatText()
    }
  }

// ── BotApiCodeWriterService ──

export class BotApiCodeWriterService extends Effect.Service<BotApiCodeWriterService>()(
  "BotApiCodeWriterService",
  {
    effect: Effect.gen(function* () {
      const { createTsFile } = yield* TsMorpthWriter

      const typeSrcFile = yield* createTsFile("types", "src", "specification")

      const apiSrcFile = yield* createTsFile("api", "src", "specification")

      return {
        writeTypes: writeTypes(typeSrcFile),
        writeMethods: writeMethods(apiSrcFile)
      } as const
    })
  }
) {}

// ── WebAppCodeWriterService ──

export class WebAppCodeWriterService extends Effect.Service<WebAppCodeWriterService>()(
  "WebAppCodeWriterService",
  {
    effect: Effect.gen(function* () {
      const { createTsFile } = yield* TsMorpthWriter
      const srcFile = yield* createTsFile("webapp", "src", "specification")

      return {
        writeWebApp: writeWebApp(srcFile)
      } as const
    })
  }
) {}

const writeWebApp =
  (src: TsSourceFile) => (extractedWebApp: ExtractedWebApp) => {
    const eventHandlerNamespaceAlias = "T"

    src.addStatements("// GENERATED CODE ")

    src.addImportDeclaration({
      moduleSpecifier: "../event-handlers",
      namespaceImport: eventHandlerNamespaceAlias,
      isTypeOnly: true
    })

    src
      .addInterface({
        name: "WebApp",
        isExported: true,
        properties: extractedWebApp.fields.map((field) => ({
          name: field.name,
          type: field.type.getTsType()
        }))
      })
      .formatText()

    for (const type of extractedWebApp.types) {
      addTypeOrInterface(src, type).formatText()
    }
  }
