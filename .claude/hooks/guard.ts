// PreToolUse hook on Bash: asks before a command that reaches past the working tree.
// Matches each `&&`/`;`/`|` segment anywhere in the line, which the settings' prefix
// globs could not (`cd x && …`, `VAR=… cmd`, `pnpm --filter x exec wrangler …`).
// It only ever answers `ask` or stays silent; `allow` rules stay in settings.json.

type Rule = { pattern: RegExp; reason: string }

const PNPM_FLAGS = String.raw`(?:\s+(?:--filter|-F|-C|--dir)\s+\S+|\s+--?[\w-]+)*`
const pnpm = (tail: string) => new RegExp(String.raw`\bpnpm${PNPM_FLAGS}\s+${tail}`)
const git = (tail: string) => new RegExp(String.raw`\bgit(?:\s+-[Cc]\s+\S+)*\s+${tail}`)
const wrangler = (tail: string) => new RegExp(String.raw`\bwrangler\s+${tail}`)

const DEPLOY = "deploys run in CI (deploy-demo.yml, deploy-website.yml), locally only on an ask"
const RELEASE = "versioning and publishing are CI's job (changesets + OIDC), never local"
const LIVE_BOT = "talks to the live bot through the real Bot API (webhook, messages)"
const PACKAGE_RUNNER =
  "resolves through the package manager and may start an install; call node_modules/.bin/<tool>"

const rules: ReadonlyArray<Rule> = [
  { pattern: wrangler(String.raw`(?:deploy|versions\s+deploy|rollback|delete)\b`), reason: DEPLOY },
  { pattern: pnpm(String.raw`(?:run\s+)?deploy\b`), reason: DEPLOY },
  { pattern: /\bmake\b.*\bdeploy\b/, reason: DEPLOY },
  { pattern: /\bchangeset\s+(?:version|publish)\b/, reason: RELEASE },
  { pattern: pnpm(String.raw`publish\b`), reason: RELEASE },
  { pattern: /\bnpm\s+publish\b/, reason: RELEASE },
  {
    pattern: wrangler(
      String.raw`(?:secret\s+(?:put|delete|bulk)|kv\s+namespace\s+(?:create|delete))\b`
    ),
    reason: "creates or deletes a Cloudflare resource or secret"
  },
  { pattern: /\bmake\b.*\b(?:set|delete)-webhook\b/, reason: LIVE_BOT },
  { pattern: /\bcurl\b.*\bapi\.telegram\.org\b/, reason: LIVE_BOT },
  { pattern: git(String.raw`push\b`), reason: "push only on an explicit ask" },
  {
    pattern: git(String.raw`(?:reset|rebase|checkout)\b`),
    reason: "rewrites history or discards changes"
  },
  {
    pattern: pnpm(String.raw`(?:install|i|add|remove|rm|uninstall|update|up)\b`),
    reason: "changes dependencies"
  },
  { pattern: pnpm(String.raw`(?:exec|dlx)\b`), reason: PACKAGE_RUNNER },
  { pattern: /\bnpx\s/, reason: PACKAGE_RUNNER }
]

export const guard = (command: string): ReadonlyArray<string> => {
  const reasons = new Set<string>()
  for (const segment of command.split(/&&|\|\||[;|\n]/)) {
    for (const rule of rules) {
      if (rule.pattern.test(segment)) reasons.add(rule.reason)
    }
  }
  return [...reasons]
}

const ask = (reason: string) =>
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason: `guard: ${reason}`
      }
    })
  )

if (import.meta.main) {
  let input = ""
  for await (const chunk of process.stdin) input += chunk
  // A crash would let the command through, so every failure asks instead.
  try {
    const payload: unknown = JSON.parse(input)
    const toolInput =
      typeof payload === "object" && payload !== null
        ? Reflect.get(payload, "tool_input")
        : undefined
    const command =
      typeof toolInput === "object" && toolInput !== null
        ? Reflect.get(toolInput, "command")
        : undefined
    if (typeof command !== "string") ask("no command in the hook input")
    else {
      const reasons = guard(command)
      if (reasons.length > 0) ask(reasons.join("; "))
    }
  } catch (error) {
    ask(`hook failed (${error instanceof Error ? error.message : String(error)}), confirm by hand`)
  }
}
