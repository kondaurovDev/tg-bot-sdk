---
paths:
  - "packages/e2e/**"
  - ".github/workflows/e2e.yml"
---

# `packages/e2e`: the types against the real API

- Private package. `test/live.test.ts` calls the real Bot API and validates every response against `apps/website/public/bot-api.json` (written by codegen); `src/validate.ts` is driven by the spec alone and names no type or method.
- The live run needs `bot_token` and `chat_id` and is skipped without them; the `e2e` script sets `E2E_REQUIRED=true`, which turns the skip into a failure. The `E2E` workflow runs it daily, on a new docs snapshot and by hand, with the demo bot's token.
- Every step must be safe on a bot that is in use: no `set_webhook` / `delete_webhook` / `log_out` / `close`, nothing that cannot be undone, and whatever a step sets or sends it removes.
- An issue never quotes a response value (the CI log is public): only the spec place and the response path.
- Any difference fails the run. A known one goes into `src/known-drift.ts` with a reason, never into a looser validator.
- `test/harness.test.ts` runs the harness against the emulator, so it needs the emulator's `dist/`.
