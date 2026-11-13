// node --test .claude/hooks/guard.test.ts
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

import { guard } from "./guard.ts"

const asks = [
  "wrangler deploy",
  "cd apps/example && wrangler versions deploy",
  "pnpm --filter example run deploy",
  "pnpm --filter website deploy",
  "make -C apps/example deploy",
  "node_modules/.bin/changeset version",
  "pnpm changeset publish",
  "pnpm -r publish",
  "npm publish --provenance",
  "wrangler secret put BOT_TOKEN",
  "wrangler kv namespace create DEMO_STATE",
  "make set-webhook",
  "cd apps/example && make delete-webhook",
  `curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo"`,
  "git push origin main",
  "git -C ../procdeck push",
  "git reset --hard HEAD~1",
  "git checkout -- file.ts",
  "pnpm add effect",
  "pnpm --filter website add -D astro",
  "pnpm install",
  "pnpm i",
  "pnpm exec oxfmt --write .",
  "pnpm --filter example exec wrangler dev",
  "pnpm dlx tsx script.ts",
  "npx vitest run"
]

const passes = [
  "ls",
  "pnpm build",
  "pnpm typecheck",
  "pnpm test",
  "pnpm lint",
  "pnpm format:check",
  "pnpm --filter @effect-ak/tg-bot-api gen",
  "pnpm --filter @effect-ak/tg-bot run test",
  "node_modules/.bin/vitest run",
  "node_modules/.bin/changeset status",
  "cd packages/api && ../../node_modules/.bin/tsc",
  "curl -sS https://core.telegram.org/bots/api-changelog",
  "wrangler dev",
  "make dev",
  "git status",
  "git log --oneline -5",
  "git diff HEAD",
  "git commit -m 'feat(api): update to Telegram Bot API 10.4'",
  "procdeck logs website"
]

for (const command of asks)
  void test(`asks: ${command}`, () => assert.notEqual(guard(command).length, 0))
for (const command of passes)
  void test(`passes: ${command}`, () => assert.deepEqual(guard(command), []))

const run = (stdin: string) =>
  execFileSync(process.execPath, [fileURLToPath(new URL("guard.ts", import.meta.url))], {
    input: stdin
  }).toString()

void test("answers ask over the hook protocol", () => {
  const reply = JSON.parse(
    run(JSON.stringify({ tool_name: "Bash", tool_input: { command: "git push origin main" } }))
  )
  assert.equal(reply.hookSpecificOutput.permissionDecision, "ask")
})

void test("stays silent on a harmless command", () => {
  assert.equal(run(JSON.stringify({ tool_name: "Bash", tool_input: { command: "ls" } })), "")
})

void test("asks on input it cannot read", () => {
  assert.equal(JSON.parse(run("not json")).hookSpecificOutput.permissionDecision, "ask")
})
