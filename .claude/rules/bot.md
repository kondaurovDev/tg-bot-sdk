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
- `extractUpdate` splits an update into `{ type, payload }`. The kind never goes into the payload: `Poll` and `WidgetQuery` have a `type` field of their own.
- Dispatch stays typed by being generic in the kind (`bindHandler`, `executeCall`): the handler and its payload, the method and its params, are the same `K`. The `on_` and `send_` prefixes are what the compiler cannot follow; the assertions for them live in `handlerFor` / `toUpdatesHandlers` (`types.ts`) and `toSendCall` (`bot-processor.ts`) and nowhere else.
- `resolveChatId` and `resolveMessageTarget` narrow the payload union with `in` rather than switching on the kind, so an update kind added upstream resolves without a change — and without breaking the CI build that regenerates the types.
