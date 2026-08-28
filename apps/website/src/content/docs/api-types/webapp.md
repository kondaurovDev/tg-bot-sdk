---
title: Mini App Types
description: TypeScript types for Telegram Mini Apps (Telegram.WebApp)
---

[Telegram Mini Apps](https://core.telegram.org/bots/webapps) run inside Telegram and talk to the client through the global `Telegram.WebApp` object. Telegram documents it only as an HTML page — this package turns that page into TypeScript types using the same [code generation pipeline](/api-types/how-it-works/) as the Bot API types.

## Installation

```bash
npm install @effect-ak/tg-bot-api
```

## Usage

Declare the global `Telegram` object once, and get autocomplete for the entire `WebApp` API — buttons, cloud storage, haptics, popups, themes:

```typescript
import type { WebApp } from "@effect-ak/tg-bot-api"

declare const Telegram: { WebApp: WebApp }

const app = Telegram.WebApp
app.ready()

// Main button
app.MainButton.setText("Submit")
app.MainButton.onClick(() => {
  app.sendData(JSON.stringify({ action: "submit" }))
})
app.MainButton.show()

// Cloud storage
app.CloudStorage.setItem("key1", "some data", (error) => {
  if (error == null) {
    console.log("Saved!")
  }
})
```

For details on how Mini App types are extracted from the HTML documentation, see [How it works → Mini App Extraction](/api-types/how-it-works/#mini-app-extraction).
