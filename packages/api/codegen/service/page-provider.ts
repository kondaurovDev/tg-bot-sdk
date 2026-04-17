/**
 * @module page-provider
 *
 * Fetches and caches Telegram documentation HTML pages.
 *
 * Downloads the Bot API and Mini Apps pages from `core.telegram.org`,
 * caches them as `input/api.html` and `input/webapp.html`, and returns
 * parsed {@link DocPage} / {@link WebAppPage} instances.
 */
import { Effect, Schedule } from "effect"
import { writeFile, readFile, mkdir, stat } from "fs/promises"

import { DocPage, WebAppPage } from "~/scrape/page"

// ── HTML fetching ──

export type HtmlPageName = keyof typeof HtmlPages

const baseUrl = "https://core.telegram.org"

export const HtmlPages = {
  api: `${baseUrl}/bots/api`,
  webapp: `${baseUrl}/bots/webapps`
} as const

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

const forceRefresh = process.env.FORCE_REFRESH === "true"
const cacheTtlMs = process.env.CACHE_TTL_MS
  ? Number(process.env.CACHE_TTL_MS)
  : DEFAULT_TTL_MS

const readFresh = async (fileName: string) => {
  if (forceRefresh) return undefined
  const mtimeMs = await stat(fileName)
    .then((s) => s.mtimeMs)
    .catch(() => undefined)
  if (mtimeMs === undefined) return undefined
  if (Date.now() - mtimeMs > cacheTtlMs) return undefined
  return readFile(fileName).catch(() => undefined)
}

const getPageHtml = (page: HtmlPageName) =>
  Effect.tryPromise(async () => {
    const fileName = `input/${page}.html`
    const saved = await readFresh(fileName)
    if (saved) {
      console.log(`cached '${page}'`)
      return saved.toString("utf-8")
    }

    console.log(`fetching '${page}'`)
    const content = await fetch(HtmlPages[page]).then((_) => _.text())

    await mkdir("input", { recursive: true })
    await writeFile(fileName, content)

    return content
  }).pipe(
    Effect.retry(
      Schedule.exponential("2 seconds").pipe(
        Schedule.compose(Schedule.recurs(3))
      )
    )
  )

// ── PageProviderService ──

export class PageProviderService extends Effect.Service<PageProviderService>()(
  "PageProviderService",
  {
    scoped: Effect.gen(function* () {
      yield* Effect.addFinalizer(() => Effect.logInfo("Closing scrapeDocPage"))

      yield* Effect.logInfo("init page provider")

      return {
        api: getPageHtml("api").pipe(Effect.andThen(DocPage.fromHtmlString)),
        webapp: getPageHtml("webapp").pipe(
          Effect.andThen(WebAppPage.fromHtmlString)
        )
      } as const
    })
  }
) {}
