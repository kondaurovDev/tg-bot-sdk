/**
 * @module harness
 * A Bot API client that validates what it gets back: every successful call is
 * checked against the spec and counted, so a scenario is just the calls.
 */
import { appendFileSync } from "node:fs"

import type { Api } from "@effect-ak/tg-bot-api"
import { TgBotClientError, type MethodInput, type TgBotClient } from "@effect-ak/tg-bot-client"

import { knownDrift } from "./known-drift"
import type { BotApiSpec } from "./spec"
import { formatIssue, makeValidator, methodNameOf, type Issue } from "./validate"

/** Default pause between calls: a scenario is a burst no real bot sends. */
const PACE_MS = 300
/** The longest wait Telegram may ask for (429 `retry after N`) that is honoured. */
const MAX_RETRY_AFTER_S = 60
const MAX_RETRIES = 3

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface FoundIssue extends Issue {
  /** The method whose result had the issue, in camelCase. */
  readonly method: string
}

export interface Harness {
  readonly client: TgBotClient
  /** Call a method; throws on an API error, records the issues of its result. */
  readonly call: <M extends keyof Api>(
    method: M,
    input: MethodInput<M>
  ) => Promise<ReturnType<Api[M]>>
  /** Unexpected issues recorded since the last take, as report lines. */
  readonly takeIssues: () => string[]
  /** The run so far, as Markdown. */
  readonly summary: () => string
  /** Print the summary, and add it to the job summary when run by GitHub Actions. */
  readonly writeSummary: () => void
}

export interface HarnessOptions {
  /** Pause before every call, in milliseconds. Default: `300`. */
  paceMs?: number
}

export const makeHarness = (
  spec: BotApiSpec,
  client: TgBotClient,
  options: HarnessOptions = {}
): Harness => {
  const paceMs = options.paceMs ?? PACE_MS
  const validator = makeValidator(spec)

  const called = new Map<string, number>()
  const unexpected: FoundIssue[] = []
  const known: FoundIssue[] = []
  let pending: FoundIssue[] = []

  const isKnown = (issue: Issue): boolean =>
    knownDrift.some((drift) => drift.kind === issue.kind && drift.where === issue.where)

  const call: Harness["call"] = async (method, input) => {
    const name = methodNameOf(method)
    for (let attempt = 0; ; attempt++) {
      if (paceMs > 0) await sleep(paceMs)
      const result = await client.executeSafe(method, input)

      if (result.ok) {
        called.set(name, (called.get(name) ?? 0) + 1)
        for (const issue of validator.checkResult(name, result.data)) {
          const found = { ...issue, method: name }
          if (isKnown(issue)) known.push(found)
          else {
            unexpected.push(found)
            pending.push(found)
          }
        }
        return result.data
      }

      const { error } = result
      const retryAfter =
        error._tag === "NotOkResponse" && error.errorCode === 429
          ? Number(/retry after (\d+)/.exec(error.details ?? "")?.[1])
          : NaN
      if (attempt < MAX_RETRIES && retryAfter <= MAX_RETRY_AFTER_S) {
        await sleep((retryAfter + 1) * 1000)
        continue
      }
      // The message only: a cause may carry the request URL, which has the token
      throw new Error(`${name}: ${new TgBotClientError(error).message}`)
    }
  }

  const takeIssues = (): string[] => {
    const lines = pending.map((issue) => `${issue.method} ${formatIssue(issue)}`)
    pending = []
    return lines
  }

  /** One line per distinct issue: the same field comes in many responses. */
  const distinct = (issues: readonly FoundIssue[]): string[] => [
    ...new Set(issues.map((issue) => `\`${issue.where}\` — ${issue.kind}: ${issue.message}`))
  ]

  const summary = (): string => {
    const calls = [...called.values()].reduce((sum, n) => sum + n, 0)
    const lines = [
      `## Bot API ${spec.version} against the real Telegram`,
      "",
      `- Methods exercised: **${called.size}** of ${spec.methods.length}`,
      `- Responses validated: **${calls}**`,
      `- Unexpected differences: **${distinct(unexpected).length}**`,
      `- Known differences (\`src/known-drift.ts\`): ${distinct(known).length}`
    ]
    if (unexpected.length > 0) {
      lines.push("", "### Unexpected differences", "", ...distinct(unexpected).map((l) => `- ${l}`))
    }
    if (known.length > 0) {
      lines.push("", "### Known differences", "", ...distinct(known).map((l) => `- ${l}`))
    }
    lines.push(
      "",
      "<details><summary>Methods exercised</summary>",
      "",
      [...called.keys()]
        .sort()
        .map((name) => `\`${name}\``)
        .join(", "),
      "",
      "</details>",
      ""
    )
    return lines.join("\n")
  }

  const writeSummary = (): void => {
    const text = summary()
    console.log(text)
    const file = process.env["GITHUB_STEP_SUMMARY"]
    if (file) appendFileSync(file, text)
  }

  return { client, call, takeIssues, summary, writeSummary }
}
