---
"@effect-ak/tg-bot-api": minor
"@effect-ak/tg-bot": minor
"@effect-ak/tg-bot-emulator": minor
---

**`@effect-ak/tg-bot-api`** — `InputFile` accepts a `Blob` or `File` besides `{ file_content, file_name }`. The client always sent them; the type did not allow it.

**`@effect-ak/tg-bot`** — New `parseWebhookRequest(request, secret_token?)`: verifies the secret token in constant time and reads the `Update`, returning `{ ok: true, update }` or `{ ok: false, status: 400 | 403, reason }`. `createWebhook` uses it; a router that dispatches updates itself (several bots behind one token) should too. A body that is not valid JSON now gets `400` instead of `500`.

**`@effect-ak/tg-bot-emulator`** — Media sent as a `Blob` or `File` is stored with its bytes (a `File` keeps its name), so `get_file` round-trips it like `file_content` uploads.
