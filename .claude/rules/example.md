---
paths:
  - "apps/example/**"
---

# `apps/example`: the live demo

- A Cloudflare Worker (`src/worker.ts`) hosting several demo bots (`src/bots/`) behind one bot token, switched via an inline menu with per-chat state in KV.
- Deployed by `.github/workflows/deploy-demo.yml`; a local `wrangler deploy` only on an explicit ask.
- `src/polling/` runs the same bots locally with long polling. Its scripts use the `tsx` CLI, which fails in the sandbox (it opens an IPC pipe): run a file with `node --import tsx <file>`.
- `Makefile` wraps local dev (`wrangler dev`, tunnel, set-webhook). `make set-webhook` and `make delete-webhook` reach the live bot.
- Demos (`src/bots/registry.ts`): Menu (`defineScreens`), Tic-tac-toe (an HTML widget, Bot API 10.4), Streaming (`ctx.stream`, fixed answers, no LLM), File. The home bot also answers `/features` with a rich message and inline queries with code snippets — inline mode must be switched on in @BotFather.
- An update kind a demo needs must be in `allowed_updates` in `worker.ts` (`/setup` re-registers the webhook on every deploy).
- `test/demos.test.ts` runs every demo against the emulator; a new demo gets a test there. The widget's HTML must stay within 32 KB and 4 KB after zlib level 9 — the test checks both.
