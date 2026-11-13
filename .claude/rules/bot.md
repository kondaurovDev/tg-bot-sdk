---
paths:
  - "packages/bot/**"
---

# `packages/bot`: the bot framework

- Fluent builder API: `createBot().command("/start", h).onText(h).onCallback(data, h)` shortcuts, `.onMessage(({ command, text, fallback }) => [...])` for ordered handler lists, `bot.use(plugin)`.
- Guarded handler pattern; handlers receive `{ payload, ctx }`, where `payload` is the typed `Message` / `CallbackQuery`, not the `Update`.
- Handlers return a `BotResponse` (a list of API calls); the processor executes them and auto-answers callback queries.
- Long polling with offset management; webhook support with secret token verification.
- `defineScreens` (`src/screens.ts`) describes inline-keyboard navigation as data.
- Update kinds are derived from the generated `Update` type, so a new Bot API version can add handlers — or break the processor — without a line changing here. Typecheck and test this package after every codegen run.
