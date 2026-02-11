import { Effect, Logger, LogLevel } from "effect"
import { test } from "vitest"

import { DocPage } from "~/scrape/page"
import { PageProviderService } from "~/service/page-provider"
import { BotApiCodeWriterService, TsMorpthWriter } from "~/service/code-writers"
import { BotApiCodegenRuntime } from "~/runtime"

interface Fixture {
  readonly apiPage: DocPage
  readonly codeWriter: BotApiCodeWriterService
  readonly tsMorph: TsMorpthWriter
}

const MainDependencies = Effect.gen(function* () {
  const htmlPageProvider = yield* PageProviderService
  const apiPage = yield* htmlPageProvider.api
  const webAppPage = yield* htmlPageProvider.webapp
  const codeWriter = yield* BotApiCodeWriterService
  const tsMorph = yield* TsMorpthWriter

  return { apiPage, webAppPage, codeWriter, tsMorph } as const
}).pipe(Effect.provide(BotApiCodegenRuntime))

const mainPromise = MainDependencies.pipe(
  Logger.withMinimumLogLevel(LogLevel.Debug),
  Effect.tapErrorCause(Effect.logError),
  Effect.runPromise
)

export const fixture = test.extend<Fixture>({
  apiPage: async ({}, use) => {
    const { apiPage } = await mainPromise
    use(apiPage)
  },
  codeWriter: async ({}, use) => {
    const { codeWriter } = await mainPromise
    use(codeWriter)
  },
  tsMorph: async ({}, use) => {
    const { tsMorph } = await mainPromise
    use(tsMorph)
  }
})
