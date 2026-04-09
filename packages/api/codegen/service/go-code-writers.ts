/**
 * @module go-code-writers
 *
 * Effect service that generates Go source files from extracted Bot API entities.
 * Writes types, methods, and unmarshal functions to the configured output directory.
 */
import * as fs from "node:fs"
import * as path from "node:path"
import { execSync } from "node:child_process"
import { Config, Effect } from "effect"

import type { ExtractedTypeShape, ExtractedMethodShape } from "~/scrape/entity"
import { writeGoTypes } from "~/go/write-go-types"
import { writeGoMethods } from "~/go/write-go-methods"
import { writeGoUnmarshal } from "~/go/write-go-unmarshal"

export class GoCodeWriterService extends Effect.Service<GoCodeWriterService>()(
  "GoCodeWriterService",
  {
    effect: Effect.gen(function* () {
      const goOutDir = yield* Config.string("go-out-dir")

      yield* Effect.logInfo(`Go output directory: ${goOutDir}`)

      const pendingFiles = new Map<string, string>()

      return {
        writeTypes: (types: ExtractedTypeShape[]) => {
          const { source, unions } = writeGoTypes(types)
          pendingFiles.set("types_generated.go", source)
          return unions
        },

        writeMethods: (
          methods: ExtractedMethodShape[],
          types: ExtractedTypeShape[]
        ) => {
          const source = writeGoMethods(methods, types)
          pendingFiles.set("methods_generated.go", source)
        },

        saveFiles: Effect.gen(function* () {
          if (!fs.existsSync(goOutDir)) {
            fs.mkdirSync(goOutDir, { recursive: true })
          }

          for (const [fileName, content] of pendingFiles) {
            const filePath = path.join(goOutDir, fileName)
            fs.writeFileSync(filePath, content)
            yield* Effect.logInfo(`Written ${filePath}`)

            // Run gofmt if available
            try {
              execSync(`gofmt -w "${filePath}"`, { stdio: "pipe" })
            } catch {
              yield* Effect.logWarning(
                `gofmt not available or failed for ${fileName}`
              )
            }
          }

          yield* Effect.logInfo(
            `Go generation complete: ${pendingFiles.size} files`
          )
        }),
      }
    }),
  }
) {}
