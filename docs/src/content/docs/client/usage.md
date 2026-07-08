---
title: How to Use Client
description: Create a client, send messages, upload files, and handle errors
---

## Setup

```typescript
import { makeTgBotClient } from "@effect-ak/tg-bot-client"

const client = makeTgBotClient({
  bot_token: "YOUR_BOT_TOKEN"
})
```

If you run a [self-hosted Bot API server](https://core.telegram.org/bots/api#using-a-local-bot-api-server), pass a custom base URL. You can also tune the request timeout (60 seconds by default):

```typescript
const client = makeTgBotClient({
  bot_token: "YOUR_BOT_TOKEN",
  base_url: "https://your-custom-server.com",
  timeout: 10_000 // milliseconds
})
```

All Telegram Bot API methods are available through `client.execute(method, params)`. Method names match the official API in snake_case — `send_message`, `send_photo`, `get_chat`, and so on. TypeScript will autocomplete both the method name and its parameters.

`execute` returns the API result directly and throws a `TgBotClientError` on failure. If you prefer handling errors as values, use `client.executeSafe(method, params)` — it returns a `ClientResult`, a simple `{ ok, data }` or `{ ok, error }` object. See [Errors](#errors) below for all possible error types.

Both methods accept an optional third argument with a per-call timeout and an abort signal:

```typescript
await client.execute(
  "get_updates",
  { timeout: 50 },
  {
    timeout: 60_000, // overrides the client-level timeout for this call
    signal: abortController.signal
  }
)
```

## Message Effects

You can pass an emoji directly as `message_effect_id` — the client resolves it to the correct Telegram effect ID automatically:

```typescript
const result = await client.execute("send_message", {
  chat_id: "123456789",
  text: "Message with fire effect!",
  message_effect_id: "🔥"
})
```

### Available free effects

These 6 effects are available for all bots without Telegram Premium:

| Emoji | Description  |
| ----- | ------------ |
| 🔥    | Fire         |
| 👍    | Thumbs up    |
| 👎    | Thumbs down  |
| ❤️    | Heart        |
| 🎉    | Party popper |
| 💩    | Poop         |

Telegram Premium unlocks hundreds of additional effects, but their IDs can only be obtained dynamically via the [MTProto API](https://core.telegram.org/api/effects) (`messages.getAvailableEffects`), not through the Bot API. If you have a Premium effect ID, you can still pass it as a raw string.

## Examples

### Messages

#### Basic Text Message

```typescript
// execute throws TgBotClientError on failure
const message = await client.execute("send_message", {
  chat_id: "123456789",
  text: "Hello from TypeScript!"
})

console.log("Sent message:", message.message_id)
```

With `executeSafe` the same call never throws:

```typescript
const result = await client.executeSafe("send_message", {
  chat_id: "123456789",
  text: "Hello from TypeScript!"
})

if (!result.ok) {
  console.error(result.error._tag, result.error)
  return
}

console.log("Sent message:", result.data.message_id)
```

#### Message with Formatting

```typescript
const result = await client.execute("send_message", {
  chat_id: "123456789",
  text: "*Bold* _italic_ `code`",
  parse_mode: "Markdown"
})
```

#### Message with Inline Keyboard

```typescript
const result = await client.execute("send_message", {
  chat_id: "123456789",
  text: "Choose an option:",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "Option 1", callback_data: "opt_1" },
        { text: "Option 2", callback_data: "opt_2" }
      ]
    ]
  }
})
```

### Files

#### Sending a Document

```typescript
const result = await client.execute("send_document", {
  chat_id: "123456789",
  document: {
    file_content: new TextEncoder().encode("Hello from file!"),
    file_name: "hello.txt"
  },
  caption: "Simple text file"
})
```

#### Sending a Photo

```typescript
const result = await client.execute("send_photo", {
  chat_id: "123456789",
  photo: {
    file_content: photoBuffer,
    file_name: "image.jpg"
  },
  caption: "Check out this photo!"
})
```

### File Download

```typescript
// getFile throws TgBotClientError on failure
const file = await client.getFile({
  fileId: "AgACAgIAAxkBAAI..."
})

console.log(file.file_name)
const base64 = file.base64String()
```

The non-throwing variant is `getFileSafe`:

```typescript
const result = await client.getFileSafe({
  fileId: "AgACAgIAAxkBAAI..."
})

if (result.ok) {
  console.log(result.data.file_name)
}
```

## Errors

Every failure is described by a `ClientErrorReason` — a tagged union. `execute` and `getFile` throw it wrapped in a `TgBotClientError`:

```typescript
import { TgBotClientError } from "@effect-ak/tg-bot-client"

try {
  const message = await client.execute("send_message", {
    chat_id: "123456789",
    text: "Hello!"
  })
} catch (error) {
  if (error instanceof TgBotClientError) {
    console.error(error.reason._tag, error.message)
  }
}
```

`executeSafe` and `getFileSafe` never throw — they return a `ClientResult<T>` discriminated union:

```typescript
type ClientResult<T> = { ok: true; data: T } | { ok: false; error: ClientErrorReason }
```

Check `result.error._tag` to determine what went wrong:

```typescript
if (!result.ok) {
  switch (result.error._tag) {
    case "NotOkResponse":
      console.error("API error:", result.error.errorCode, result.error.details)
      break
    case "RequestTimeout":
      console.error("Timed out after", result.error.timeoutMs, "ms")
      break
    case "UnexpectedResponse":
      console.error("Unexpected response:", result.error.response)
      break
    case "ClientInternalError":
      console.error("Internal error:", result.error.cause)
      break
    case "UnableToGetFile":
      console.error("File download error:", result.error.cause)
      break
    case "NotJsonResponse":
      console.error("Invalid JSON response:", result.error.response)
      break
  }
  return
}

// result.data is fully typed
console.log(result.data.message_id)
```

### Error types

| Tag                   | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `NotOkResponse`       | Telegram API returned an error (e.g., invalid chat_id) |
| `RequestTimeout`      | Request exceeded the configured timeout                |
| `UnexpectedResponse`  | Response didn't match expected format                  |
| `ClientInternalError` | Internal error (network failure, etc.)                 |
| `UnableToGetFile`     | File download failed                                   |
| `NotJsonResponse`     | Response was not valid JSON                            |
