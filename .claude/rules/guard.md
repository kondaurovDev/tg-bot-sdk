---
paths:
  - ".claude/hooks/**"
  - ".claude/settings.json"
---

# Intent behind the guarded commands

The guard is a PreToolUse hook, `.claude/hooks/guard.ts` (a rule table, tests beside it: `node --test .claude/hooks/guard.test.ts`), not settings `ask` globs. It only asks; a new guarded command is a rule there plus its case in the test. `allow` rules, the sandbox's network domains and the commands that run outside the sandbox stay in `.claude/settings.json`.

- Deploys (`wrangler deploy`, `pnpm … deploy`, `make deploy`) run in CI: `deploy-demo.yml` and `deploy-website.yml`. A local one happens only on an explicit ask.
- `changeset version`, `changeset publish` and `publish` are CI's job, never local.
- `make set-webhook`, `make delete-webhook` and `curl` to `api.telegram.org` reach the live demo bot. The emulator and the playground's virtual mode cover everything that does not need a real token.
- `git push` only on an explicit ask in the current exchange; `git reset`, `rebase` and `checkout` can discard work.
- `pnpm install`, `add`, `remove` and `update` change dependencies and the lockfile.
- `pnpm exec`, `pnpm dlx` and `npx` resolve through the package manager and may start an install that cannot complete in the sandbox.
