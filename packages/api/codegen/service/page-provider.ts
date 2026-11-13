/**
 * @module page-provider
 *
 * Provides the Telegram documentation pages codegen reads.
 *
 * The pages are a committed snapshot (`input/api.html`, `input/webapp.html`),
 * so a build — the release build included — always generates the types that
 * were reviewed and committed, with no network access. Only a refresh
 * (`CODEGEN_REFRESH=true`, the `gen:refresh` script) downloads the live pages
 * and replaces the snapshot.
 */
import { Effect, Schedule } from "effect"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import * as Path from "node:path"

import { DocPage, WebAppPage } from "~/scrape/page"

// ── HTML snapshot ──

export type HtmlPageName = keyof typeof HtmlPages

const baseUrl = "https://core.telegram.org"

export const HtmlPages = {
  api: `${baseUrl}/bots/api`,
  webapp: `${baseUrl}/bots/webapps`
} as const

const inputDir = Path.resolve(import.meta.dirname, "..", "..", "input")

const snapshotPath = (page: HtmlPageName) => Path.join(inputDir, `${page}.html`)

const refresh = process.env.CODEGEN_REFRESH === "true"

/**
 * Telegram stamps every response with the time it took to render. Dropping
 * the stamp makes the snapshot change only when the documentation does.
 */
export const normalizeDocsHtml = (html: string): string =>
  html.replace(/<!-- page generated in [\d.]+m?s -->\s*/g, "")

const readSnapshot = async (page: HtmlPageName): Promise<string> => {
  const path = snapshotPath(page)
  const saved = await readFile(path, "utf-8").catch(() => undefined)
  if (saved === undefined) {
    throw new Error(
      `No docs snapshot at ${path}. Run \`pnpm --filter @effect-ak/tg-bot-api gen:refresh\` to download it.`
    )
  }
  return saved
}

const downloadSnapshot = async (page: HtmlPageName): Promise<string> => {
  console.log(`fetching '${page}'`)
  const response = await fetch(HtmlPages[page])
  if (!response.ok) throw new Error(`Fetching ${HtmlPages[page]} failed: HTTP ${response.status}`)
  const content = normalizeDocsHtml(await response.text())
  await mkdir(inputDir, { recursive: true })
  await writeFile(snapshotPath(page), content)
  return content
}

const getPageHtml = (page: HtmlPageName) =>
  refresh
    ? Effect.tryPromise(() => downloadSnapshot(page)).pipe(
        Effect.retry(Schedule.exponential("2 seconds").pipe(Schedule.compose(Schedule.recurs(3))))
      )
    : Effect.tryPromise(() => readSnapshot(page))

// ── PageProviderService ──

export class PageProviderService extends Effect.Service<PageProviderService>()(
  "PageProviderService",
  {
    scoped: Effect.gen(function* () {
      yield* Effect.addFinalizer(() => Effect.logInfo("Closing scrapeDocPage"))

      yield* Effect.logInfo("init page provider")

      return {
        api: getPageHtml("api").pipe(Effect.andThen(DocPage.fromHtmlString)),
        webapp: getPageHtml("webapp").pipe(Effect.andThen(WebAppPage.fromHtmlString))
      } as const
    })
  }
) {}
