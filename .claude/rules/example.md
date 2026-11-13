---
paths:
  - "apps/example/**"
---

# `apps/example`: the live demo

- A Cloudflare Worker (`src/worker.ts`) hosting several demo bots (`src/bots/`) behind one bot token, switched via an inline menu with per-chat state in KV.
- Deployed by `.github/workflows/deploy-demo.yml`; a local `wrangler deploy` only on an explicit ask.
- `src/polling/` runs the same bots locally with long polling. Its scripts use the `tsx` CLI, which fails in the sandbox (it opens an IPC pipe): run a file with `node --import tsx <file>`.
- `Makefile` wraps local dev (`wrangler dev`, tunnel, set-webhook). `make set-webhook` and `make delete-webhook` reach the live bot.
