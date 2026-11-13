---
paths:
  - "packages/emulator/**"
---

# `packages/emulator`: in-memory Bot API

- `makeTgBotEmulator()` returns a `TgBotClient`-compatible client with real long-poll `get_updates`, one private chat, and user-side actions (`sendMessage`, `tapButton`, `react`, …).
- `bot.run()` / `createWebhook()` accept `client` instead of `bot_token`, so a bot runs against it unchanged. The website playground runs it in a Web Worker for its virtual mode.
- Read `docs/architecture.md` before changing it (module map, the single mutable state, the flows) and keep it and `docs/todo.md` (the gap list against the current Bot API) in step with the code.
- Guiding rule: emulate faithfully what bots commonly exercise in tests and the playground; stay lenient elsewhere.
- `bot` is a dev dependency used only by the tests, and they typecheck against its `dist/` — rebuild `bot` first.
