/**
 * @module main
 *
 * Entry point. Reads MODULE_NAME from env (`bot_api` or `webapp`) and runs
 * the corresponding code generation pipeline.
 */
import * as fs from "node:fs"
import * as path from "node:path"
import { Config, Effect, Logger, LogLevel } from "effect"

import { extractBotApiEntities, ExtractedWebApp } from "./scrape/entities"
import {
  BotApiCodeWriterService,
  GoCodeWriterService,
  PageProviderService,
  WebAppCodeWriterService
} from "./service/index"
import { MarkdownWriterService } from "./service/markdown"
import { BotApiCodegenRuntime, WebAppCodegenRuntime } from "./runtime"
import { TsMorpthWriter } from "./service/code-writers"
import { writeGoUnmarshal } from "./go/write-go-unmarshal"

const rootDir = path.resolve(import.meta.dirname, "..", "..", "..")
const pkgDir = path.resolve(import.meta.dirname, "..")
const docsDataDir = path.resolve(rootDir, "docs", "src", "data")

const updateReadmeBadge = (pattern: RegExp, replacement: string) => {
  for (const dir of [pkgDir, rootDir]) {
    const readmePath = path.resolve(dir, dir === pkgDir ? "readme.md" : "README.md")
    if (!fs.existsSync(readmePath)) continue
    const content = fs.readFileSync(readmePath, "utf-8")
    fs.writeFileSync(readmePath, content.replace(pattern, replacement))
  }
}

const generateBotApi = Effect.fn("generate bot api")(function* () {
  const pageProvider = yield* PageProviderService
  const apiPage = yield* pageProvider.api

  const apiVersion = yield* apiPage.getLatestVersion()

  const tsMorph = yield* TsMorpthWriter
  const codeWriter = yield* BotApiCodeWriterService
  const markdownWriter = yield* MarkdownWriterService
  const entities = yield* extractBotApiEntities(apiPage)

  codeWriter.writeTypes(entities.types)
  codeWriter.writeMethods(entities.methods)

  // Go code generation
  const goWriter = yield* GoCodeWriterService
  const unions = goWriter.writeTypes(entities.types)
  goWriter.writeMethods(entities.methods, entities.types)

  // Write unmarshal file directly (depends on unions from writeTypes)
  const unmarshalSource = writeGoUnmarshal(unions)
  if (unmarshalSource) {
    const goOutDir = yield* Config.string("go-out-dir")
    fs.writeFileSync(
      path.resolve(goOutDir, "unmarshal_generated.go"),
      unmarshalSource
    )
  }

  yield* goWriter.saveFiles

  yield* markdownWriter.writeSpecification({
    ...entities,
    apiVersion
  })

  yield* tsMorph.saveFiles

  fs.writeFileSync(
    path.resolve(pkgDir, "bot-api-version.json"),
    JSON.stringify({ version: apiVersion }, null, 2) + "\n"
  )

  const methodCount = entities.methods.length
  const typeCount = entities.types.length

  fs.writeFileSync(
    path.resolve(docsDataDir, "bot-api-stats.json"),
    JSON.stringify({ version: apiVersion, methodCount, typeCount }, null, 2) + "\n"
  )

  // Update JSON-LD in faq frontmatter (YAML can't use JS imports)
  const faqPath = path.resolve(rootDir, "docs", "src", "content", "docs", "faq.mdx")
  if (fs.existsSync(faqPath)) {
    const faqContent = fs.readFileSync(faqPath, "utf-8")
    fs.writeFileSync(faqPath, faqContent.replace(
      /covers \d+ types and \d+\+? methods/g,
      `covers ${typeCount} types and ${methodCount} methods`
    ))
  }

  updateReadmeBadge(/BotApi-[\d.]+/, `BotApi-${apiVersion}`)
})

const generateWebApp = Effect.fn("generate web app")(function* () {
  const pageProvider = yield* PageProviderService
  const webappPage = yield* pageProvider.webapp

  const webAppVersion = yield* webappPage.getLatestVersion()

  const tsMorph = yield* TsMorpthWriter
  const { writeWebApp } = yield* WebAppCodeWriterService

  const extractedWebApp = yield* ExtractedWebApp.make(webappPage)

  writeWebApp(extractedWebApp)

  yield* tsMorph.saveFiles

  fs.writeFileSync(
    path.resolve(pkgDir, "mini-app-version.json"),
    JSON.stringify({ version: webAppVersion }, null, 2) + "\n"
  )

  updateReadmeBadge(/Telegram\.WebApp-[\w.]+/, `Telegram.WebApp-${webAppVersion}`)
})

const gen = Effect.fn("Generate")(function* () {
  const module = yield* Config.literal("bot_api", "webapp")("MODULE_NAME")
  if (module == "bot_api") {
    yield* generateBotApi().pipe(Effect.provide(BotApiCodegenRuntime))
  } else {
    yield* generateWebApp().pipe(Effect.provide(WebAppCodegenRuntime))
  }
})

gen()
  .pipe(Logger.withMinimumLogLevel(LogLevel.Debug), Effect.runPromise)
  .then(() => console.log("done generating"))
