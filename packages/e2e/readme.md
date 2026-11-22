# @effect-ak/tg-bot-e2e

Checks the generated Bot API types against the real Telegram API. Private, not published.

The types in `@effect-ak/tg-bot-api` are generated from the Telegram docs. This package calls the real API with a real bot and validates every response against the same spec (`bot-api.json`), so a difference between the docs and what Telegram actually sends fails a run instead of reaching users.

## What a run reports

| Issue                | Meaning                                                                         |
| -------------------- | ------------------------------------------------------------------------------- |
| `missing-field`      | A field the types call required did not come                                    |
| `wrong-type`         | A value of another type than declared                                           |
| `unknown-field`      | Telegram sent a field the types do not have: the docs or the scraper are behind |
| `unknown-enum-value` | A string outside the union the types list                                       |
| `unknown-variant`    | A union member the types do not list                                            |

Any of them fails the run. An issue names the place in the spec (`User.first_name`) and in the response (`result.chat.first_name`), never the values: the log of a public CI run shows no ids, names or texts.

A difference that is known and accepted goes into `src/known-drift.ts` with its reason; it is then reported without failing. On an `unknown-field`, check the [changelog](https://core.telegram.org/bots/api-changelog) first: it usually means a new Bot API version, and the fix is to regenerate the types.

## Running it

```bash
pnpm --filter @effect-ak/tg-bot-api gen            # writes the spec
bot_token=... chat_id=... pnpm --filter @effect-ak/tg-bot-e2e e2e
```

- `bot_token`: a bot's token. The run is safe on a bot that is in use: it never touches the webhook (and skips `get_updates` when one is set), what it sets it removes, and the messages it sends it deletes.
- `chat_id`: a chat the bot can write to. A private chat with the bot works (send it `/start` once). A group where the bot is an administrator covers more: pinning, administrators, invite links.

`pnpm test` runs the validator's own tests and skips the live run when the two variables are absent. `e2e` sets `E2E_REQUIRED=true`, which makes their absence a failure, so CI cannot pass by skipping.

In CI the `E2E` workflow runs it daily, on every new docs snapshot, and by hand, with the secrets `DEMO_BOT_TOKEN` and `E2E_CHAT_ID`.

## What is covered

The steps in `test/live.test.ts`: the bot's identity, profile and settings, scoped commands, webhook info, stars and gifts, stickers, and in the test chat text, reactions, photos, documents, albums, locations, polls, forwarding and copying, pinning, invite links, deletion. The run's summary lists the methods it exercised out of the total.

Left out on purpose:

- methods that need a person or a special account: callback and inline queries, payments, business accounts, managed bots;
- methods that cannot be undone or break a running bot: `log_out`, `close`, `set_webhook`, `delete_webhook`, banning, leaving a chat.

## Adding a method

Add a call to a step, or a step: `h.call(method, input)` validates the result and counts the method on its own. Whatever the step creates it must remove.

## Layout

- `src/validate.ts` — the validator. It knows no type or method by name, only the spec's format.
- `src/harness.ts` — a client wrapper: validates every result, waits out rate limits, writes the summary.
- `src/known-drift.ts` — the accepted differences.
- `test/harness.test.ts` — the harness against the emulator, which also holds the emulator's responses to the spec.
