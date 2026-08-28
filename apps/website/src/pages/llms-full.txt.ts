/**
 * /llms-full.txt — all guide pages inlined as Markdown, for LLMs that want
 * the whole documentation in one request. API reference pages are excluded
 * (use /bot-api.json for that).
 */
import type { APIRoute } from "astro"
import { getCollection } from "astro:content"

const SITE = "https://tg-bot-sdk.website"

const ORDER = ["getting-started/", "bot-runner/", "client/", "api-types/", "faq"]

const rank = (id: string) => {
  const i = ORDER.findIndex((p) => id.startsWith(p))
  return i === -1 ? ORDER.length : i
}

/** Strip MDX-only bits (imports, JSX components) so the output stays plain Markdown. */
const attr = (tag: string, name: string) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1]

const toMarkdown = (body: string): string =>
  body
    .replace(/^import .*$/gm, "")
    // <LinkCard title="…" href="…" description="…" /> → markdown link
    .replace(/<LinkCard[\s\S]*?\/>/g, (tag) => {
      const title = attr(tag, "title") ?? "link"
      const href = attr(tag, "href") ?? ""
      const desc = attr(tag, "description")
      return `- [${title}](${href.startsWith("/") ? SITE + href : href})${desc ? `: ${desc}` : ""}`
    })
    // <TabItem label="npm"> → bold label
    .replace(/<TabItem[^>]*label="([^"]*)"[^>]*>/g, (_, label) => `**${label}:**`)
    // remaining Starlight components: drop the tags, keep the content
    .replace(/<\/?(Tabs|TabItem|Steps|Card|CardGrid|Aside|StarCta)\b[^>]*\/?>/g, "")
    .replace(/:::(\w+)(?:\[([^\]]*)\])?/g, (_, kind, title) => `**${title ?? kind}:**`)
    .replace(/^:::$/gm, "")
    .replace(/^\{\/\*[\s\S]*?\*\/\}$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

export const GET: APIRoute = async () => {
  const docs = (await getCollection("docs"))
    .filter((d) => !d.id.startsWith("api/") && d.id !== "api" && d.id !== "index" && d.body)
    .sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id))

  const parts = docs.map((d) =>
    [
      `# ${d.data.title}`,
      "",
      d.data.description ? `> ${d.data.description}` : "",
      `Source: ${SITE}/${d.id}/`,
      "",
      toMarkdown(d.body ?? ""),
      ""
    ].join("\n")
  )

  const body = [
    "# Telegram Bot SDK — full documentation",
    "",
    `Index: ${SITE}/llms.txt · Bot API spec: ${SITE}/bot-api.json`,
    "",
    ...parts
  ].join("\n---\n\n")

  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } })
}
