---
"@effect-ak/tg-bot": minor
"@effect-ak/tg-bot-client": minor
"@effect-ak/tg-bot-emulator": minor
---

Keep the update kind apart from its payload, and replace type assertions with checked types.

**`@effect-ak/tg-bot`**

- Fix: `poll`, `widget_query` and `shared_widget_query` updates never reached their handlers. The processor merged the update kind into the payload as `type`, and these payloads have a `type` field of their own, which overwrote it. Handlers now receive the payload exactly as Telegram sent it, with no `type` key added.
- Fix: `ctx.answerCallbackQuery()` in a `widget_query` handler built an `answer_callback_query` call instead of throwing — a widget query was told apart from a callback query by its fields, which are the same.
- The webhook handler answers `400` to a JSON body that is not an `Update` (no numeric `update_id`) instead of processing it.
- Changed: `extractUpdate(update)` returns `{ type, payload }` instead of the payload with `type` mixed in. `createBotContext` and `resolveCallbackQueryId` take that extracted update; `resolveChatId` and `resolveMessageTarget` take a payload. Before, all four accepted `unknown`.
- New exports: `AvailableUpdateTypes`, `UpdatePayload<K>`, `ExtractedUpdate<K>`. `BotApiCall` takes an optional method parameter (`BotApiCall<"send_message">`).
- `ctx.call` and `BotResponse.call` accept an emoji for `message_effect_id`, like the client.

**`@effect-ak/tg-bot-client`**

- `getFile` builds base64 with `btoa` instead of `Buffer`, so `base64String()` works in browsers and Workers too.
- New export: `MethodInput<M>` — the input of a method as `execute` / `executeSafe` accept it.

**`@effect-ak/tg-bot-emulator`**

- Fix: `get_chat` returned a `Chat`; it now returns a `ChatFullInfo` with the required fields filled in.
- Fix: a bot command in an `html` rich message became a `RichTextBotCommand` without its required `bot_command` field.
- `MethodTable` is typed against the generated `Api`, so every emulated method is checked against the real signature.
- `nextEvent` narrows its result when the predicate is a type guard.
