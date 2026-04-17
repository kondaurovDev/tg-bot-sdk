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
  PageProviderService,
  WebAppCodeWriterService
} from "./service/index"
import { MarkdownWriterService } from "./service/markdown"
import { BotApiCodegenRuntime, WebAppCodegenRuntime } from "./runtime"
import { consumeWarnings, formatWarnings } from "./warnings"
import {
  buildBotApiSpec,
  buildMiniAppSpec,
  writeSpecJson
} from "./service/spec"

const rootDir = path.resolve(import.meta.dirname, "..", "..", "..")
const pkgDir = path.resolve(import.meta.dirname, "..")
const docsDataDir = path.resolve(rootDir, "docs", "src", "data")
const docsPublicDir = path.resolve(rootDir, "docs", "public")

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

  const codeWriter = yield* BotApiCodeWriterService
  const markdownWriter = yield* MarkdownWriterService
  const entities = yield* extractBotApiEntities(apiPage)

  yield* codeWriter.writeTypes(entities.types)
  yield* codeWriter.writeMethods(entities.methods)

  yield* Effect.tryPromise(() =>
    writeSpecJson(
      path.resolve(docsPublicDir, "bot-api.json"),
      buildBotApiSpec(entities, apiVersion)
    )
  )

  yield* markdownWriter.writeSpecification({
    ...entities,
    apiVersion
  })

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

  // Mini Apps HTML marks "Bot API X.Y" — Telegram versions Mini Apps in lockstep with Bot API.
  const botApiVersion = yield* webappPage.getLatestVersion()

  const { writeWebApp } = yield* WebAppCodeWriterService

  const extractedWebApp = yield* ExtractedWebApp.make(webappPage)

  yield* writeWebApp(extractedWebApp)

  yield* Effect.tryPromise(() =>
    writeSpecJson(
      path.resolve(docsPublicDir, "mini-app.json"),
      buildMiniAppSpec(extractedWebApp, botApiVersion)
    )
  )

  fs.writeFileSync(
    path.resolve(pkgDir, "mini-app-version.json"),
    JSON.stringify({ version: botApiVersion }, null, 2) + "\n"
  )

  updateReadmeBadge(/Telegram\.WebApp-[\w.]+/, `Telegram.WebApp-${botApiVersion}`)
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
  .then(() => {
    const warnings = consumeWarnings()
    if (warnings.length > 0) console.warn(formatWarnings(warnings))
    console.log("done generating")
  })
