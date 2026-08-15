# Local dev helpers. Variables come from .dev.vars (see .dev.vars.example):
#   BOT_TOKEN, WEBHOOK_SECRET, WEBHOOK_URL
-include .dev.vars
export

SECRET_HEADER = X-Telegram-Bot-Api-Secret-Token
TG_API        = https://api.telegram.org/bot$(BOT_TOKEN)

.PHONY: help dev tunnel set-webhook delete-webhook webhook-info deploy tail

help:
	@echo "make dev             start the worker locally (wrangler dev, :8787)"
	@echo "make tunnel          expose :8787 via a cloudflared quick tunnel"
	@echo "make set-webhook     register WEBHOOK_URL/webhook with Telegram (via GET /setup)"
	@echo "make delete-webhook  remove the webhook (switch back to polling)"
	@echo "make webhook-info    show what Telegram currently has (last error etc.)"
	@echo "make deploy          wrangler deploy to your Cloudflare account"
	@echo "make tail            stream production logs"

dev:
	pnpm wrangler dev

tunnel:
	cloudflared tunnel --url http://localhost:8787

set-webhook:
	@test -n "$(WEBHOOK_URL)" || { echo "WEBHOOK_URL is not set in .dev.vars"; exit 1; }
	@test -n "$(WEBHOOK_SECRET)" || { echo "WEBHOOK_SECRET is not set in .dev.vars"; exit 1; }
	curl --fail --silent --show-error -H "$(SECRET_HEADER): $(WEBHOOK_SECRET)" "$(WEBHOOK_URL)/setup"
	@echo

delete-webhook:
	curl --fail --silent --show-error "$(TG_API)/deleteWebhook?drop_pending_updates=true"
	@echo

webhook-info:
	curl --fail --silent --show-error "$(TG_API)/getWebhookInfo"
	@echo

deploy:
	pnpm wrangler deploy

tail:
	pnpm wrangler tail
