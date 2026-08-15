# @effect-ak/tg-bot-client

[![NPM Version](https://img.shields.io/npm/v/%40effect-ak%2Ftg-bot-client)](https://www.npmjs.com/package/@effect-ak/tg-bot-client)
![NPM Downloads](https://img.shields.io/npm/dw/%40effect-ak%2Ftg-bot-client)

Type-safe HTTP client for the Telegram Bot API. One `execute` method covers every API method, files are encoded to `FormData` automatically, errors are typed. Native `fetch`, zero runtime dependencies — runs on Node.js 18+, Bun, Deno, Cloudflare Workers, browsers.

Types come from [`@effect-ak/tg-bot-api`](https://www.npmjs.com/package/@effect-ak/tg-bot-api); the bot framework [`@effect-ak/tg-bot`](https://www.npmjs.com/package/@effect-ak/tg-bot) is built on this client.

## Installation

```bash
npm install @effect-ak/tg-bot-client
```

## Quick Start

```typescript
import { makeTgBotClient } from "@effect-ak/tg-bot-client"

const client = makeTgBotClient({ bot_token: "YOUR_BOT_TOKEN" })

// Method names are snake_case, exactly as in the official docs
const message = await client.execute("send_message", {
  chat_id: 123456789,
  text: "Hello!"
})
```

## API Surface

```typescript
makeTgBotClient({ bot_token, base_url?, timeout? }): TgBotClient

interface TgBotClient {
  execute(method, params, options?): Promise<Result>            // throws TgBotClientError
  executeSafe(method, params, options?): Promise<ClientResult>  // never throws
  getFile({ fileId }): Promise<TgFile>                          // download by file_id
  getFileSafe({ fileId }): Promise<ClientResult<TgFile>>
}

type ClientResult<T> = { ok: true; data: T } | { ok: false; error: ClientErrorReason }
type ClientErrorReason =
  | { _tag: "NotOkResponse"; errorCode?: number; details?: string }  // Telegram said ok:false
  | { _tag: "RequestTimeout"; timeoutMs: number }
  | { _tag: "NotJsonResponse" | "UnexpectedResponse" | "ClientInternalError" | "UnableToGetFile"; ... }
```

- **Method and parameter names** match https://core.telegram.org/bots/api in `snake_case` (`send_message`, `edit_message_text`, `answer_callback_query`). Both are autocompleted; return types are inferred.
- **Files**: pass `{ file_content: Uint8Array, file_name: string }` wherever the API accepts `InputFile` — the client switches to multipart automatically. Or pass a `file_id` / URL string.
- **Message effects**: `message_effect_id` accepts an emoji key of `MESSAGE_EFFECTS` (`"🔥" | "👍" | "👎" | "❤️" | "🎉" | "💩"`) and is mapped to the real id.
- **Errors**: `execute` throws `TgBotClientError` (`error.reason` is the tagged union above); `executeSafe` returns the union — pick one style and stick to it.
- **Options**: `{ timeout }` per call; `base_url` for a self-hosted Bot API server.

## Examples

```typescript
// Safe variant
const result = await client.executeSafe("get_chat", { chat_id: 1 })
if (!result.ok) console.error(result.error._tag)

// Upload a file
await client.execute("send_document", {
  chat_id,
  document: { file_content: new TextEncoder().encode("hi"), file_name: "hi.txt" },
  caption: "Generated on the fly"
})

// Download a file
const file = await client.getFile({ fileId })
file.content // ArrayBuffer
```

## Documentation

- Guide: **[tg-bot-sdk.website/client/usage](https://tg-bot-sdk.website/client/usage/)**
- Bot API reference (one page per method): https://tg-bot-sdk.website/api/
- For LLMs / coding agents: https://tg-bot-sdk.website/llms.txt

## License

MIT
