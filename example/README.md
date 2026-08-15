# Examples & live demo on Cloudflare Workers

One Worker, one Telegram bot account, several demo bots inside. `/start` describes the library; `/demo` opens an inline menu to pick the active demo — the choice is stored per chat in KV and all other messages are routed to it.

The bots themselves live in [`src/bots/`](src/bots) — plain `createBot()` definitions. The Worker is the primary way to run them; the same bots can also be started locally with long polling (`pnpm polling <name>`).

## Deployment (GitHub Actions)

[`.github/workflows/deploy-demo.yml`](../.github/workflows/deploy-demo.yml) builds the packages, deploys the Worker with `wrangler`, pushes the bot secrets and registers the Telegram webhook via the Worker's `/setup` route. It runs on every push to `main` that touches the SDK or the demo, and on manual dispatch.

Repository secrets it needs:

| Secret                  | Value                                                            |
| ----------------------- | ---------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | API token with the _Edit Cloudflare Workers_ template + KV write |
| `CLOUDFLARE_ACCOUNT_ID` | Your account id                                                  |
| `DEMO_BOT_TOKEN`        | Bot token from @BotFather                                        |
| `DEMO_WEBHOOK_SECRET`   | 1–256 chars of `A-Z a-z 0-9 _ -`, e.g. `openssl rand -hex 32`    |

Nothing needs to be installed or deployed locally.

## Layout

- [`src/bots/`](src/bots) — the demo bots (`echo`, `command`, `file`, `menu`), their [`registry.ts`](src/bots/registry.ts), and the [`home.ts`](src/bots/home.ts) bot (/start, /source, /install, /features, /demo menu)
- [`src/worker.ts`](src/worker.ts) — Cloudflare Worker: routing (`POST /webhook`, `GET /setup`), dispatch to home or the active demo, KV state
- [`wrangler.jsonc`](wrangler.jsonc) — Worker config; the KV namespace is provisioned automatically on first deploy
- [`src/polling/`](src/polling) — long polling: `run.ts` starts any bot from `src/bots` (`pnpm polling menu`); `batch-bot.ts` / `reload-bot.ts` show the low-level `runBot` API (batch mode, hot reload)

## Local dev (optional)

```bash
cd example
cp .dev.vars.example .dev.vars   # fill in BOT_TOKEN / WEBHOOK_SECRET
make dev                         # wrangler dev on http://localhost:8787
make tunnel                      # cloudflared quick tunnel → https://<words>.trycloudflare.com
# put that URL into .dev.vars as WEBHOOK_URL, then:
make set-webhook                 # registers <WEBHOOK_URL>/webhook with Telegram
make webhook-info                # what Telegram sees (last_error_message etc.)
```

`make help` lists all targets (`deploy`, `tail`, `delete-webhook`).
