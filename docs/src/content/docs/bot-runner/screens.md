---
title: Screens
description: Declarative inline-keyboard navigation — describe screens as data, the SDK renders, edits in place and handles Back
---

An inline-keyboard bot keeps its UI in a single message and rewrites it as the user taps buttons. `defineScreens` lets you describe that UI as data — every screen with its text, buttons and parent — and turns it into a plugin that:

- sends the start screen on `/start`,
- redraws the message in place on every tap (`edit_message_text`),
- answers callback queries so buttons never hang,
- adds a **Back** button wherever a screen has a `parent`,
- routes custom **action** buttons to your handlers.

Adding a step to the flow means adding an entry — never a new handler.

## Basic usage

```typescript
import { createBot, defineScreens } from "@effect-ak/tg-bot"

const screens = defineScreens({
  root: {
    text: "🏠 Main menu",
    buttons: [
      [
        { label: "📋 Services", next: "services" },
        { label: "🕒 Hours", next: "hours" }
      ],
      [{ label: "🌐 Website", url: "https://example.com" }]
    ]
  },
  services: {
    text: "📋 Consultation, diagnostics, follow-up",
    parent: "root",
    buttons: [
      {
        label: "📅 Book",
        action: ({ ctx }) => ctx.answerCallbackQuery({ text: "Soon!", show_alert: true })
      }
    ]
  },
  hours: { text: "🕒 Mon–Fri 9:00–18:00", parent: "root" }
})

createBot().use(screens).webhook({ bot_token: BOT_TOKEN, secret_token: WEBHOOK_SECRET })
```

`next: "servces"` is a compile-time error — screen ids are inferred from the object keys.

## Buttons

| Shape                        | Behaviour                                                                 |
| ---------------------------- | ------------------------------------------------------------------------- |
| `{ label, next: "id" }`      | Navigate: the message is edited to show screen `id`                       |
| `{ label, url }`             | Open a link                                                               |
| `{ label, action: handler }` | Run `handler({ payload, ctx })` and send whatever it returns; screen stays |

`buttons` is either an array of rows (`[[a, b], [c]]`) or a flat list (`[a, b, c]` — one button per row).

## Dynamic screens

`text` and `buttons` can be functions of the current update, so screens can reflect state:

```typescript
const screens = defineScreens({
  root: {
    text: async ({ payload }) => `Hello, ${"from" in payload ? payload.from?.first_name : "there"}!`,
    buttons: async () => ((await isOpen()) ? [{ label: "Book", next: "book" }] : [])
  },
  book: { text: "…", parent: "root" }
})
```

## Options

```typescript
defineScreens(screens, {
  start: "root", // screen shown on the command; default: first key
  command: "/menu", // default "/start"; `false` to register no command
  back: "⬅️ Назад", // Back label; `false` to never render Back
  footer: [{ label: "Talk to a human", url: WHATSAPP_URL }], // rows on every screen
  parse_mode: "HTML", // default parse mode for texts (per-screen override available)
  onEnter: (id, { payload }) => track(id), // analytics hook, called on every screen shown
  store, // see below
  prefix: "s:" // callback_data prefix; keep it short (64-byte limit)
})
```

## Back: parent vs. undo

By default Back leads to the screen's static `parent` — no storage needed, works on a bare webhook.

If a screen is reachable from several places, a fixed parent would send users somewhere they did not come from. Pass a `store` and Back becomes **undo**: the plugin keeps a per-chat stack of visited screens (KV, Durable Object, Map — anything with `get`/`set`):

```typescript
const store = {
  get: (chatId) => env.KV.get(`nav:${chatId}`, "json"),
  set: (chatId, stack) =>
    env.KV.put(`nav:${chatId}`, JSON.stringify(stack), { expirationTtl: 86400 })
}
const screens = defineScreens(
  {
    /* … */
  },
  { store }
)
```

## Custom entry points and composition

The plugin exposes its parts, so you can wire it by hand or open screens from your own handlers:

```typescript
createBot()
  .onMessage(({ command }) => [
    command("/menu", screens.open("root")), // open a screen as a new message
    ...screens.messageHandlers // what `.use()` would register
  ])
  .onCallbackQuery(() => screens.callbackHandlers)

const { text, reply_markup } = await screens.render("root", input) // just the payload
```

## Under the hood

Generated `callback_data` is `s:g:<from>:<to>` (go), `s:b:<current>` (back) and `s:a:<screen>:<index>` (action). Unknown ids fall back to the start screen, so stale buttons on old messages never break anything.

The full demo lives in [`example/src/bots/menu.ts`](https://github.com/kondaurovDev/tg-bot-sdk/blob/main/example/src/bots/menu.ts).
