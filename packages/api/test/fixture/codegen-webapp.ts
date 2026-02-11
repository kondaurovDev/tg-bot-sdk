import { Effect, Logger, LogLevel } from "effect"
import { test } from "vitest"

import { PageProviderService } from "~/service/page-provider"
import { WebAppPage } from "~/scrape/page"

import { WebAppCodegenRuntime } from "~/runtime"

interface WebappFixture {
  readonly webAppPage: WebAppPage
}

const WebappDependencies = Effect.gen(function* () {
  const htmlPageProvider = yield* PageProviderService
  const webAppPage = yield* htmlPageProvider.webapp

  return { webAppPage } as const
}).pipe(Effect.provide(WebAppCodegenRuntime))

const webappPromise = WebappDependencies.pipe(
  Logger.withMinimumLogLevel(LogLevel.Debug),
  Effect.tapErrorCause(Effect.logError),
  Effect.runPromise
)

export const webappFixture = test.extend<WebappFixture>({
  webAppPage: async ({}, use) => {
    use((await webappPromise).webAppPage)
  }
})
