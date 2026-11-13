# @effect-ak/tg-bot-emulator-react

A Telegram-like chat for [`@effect-ak/tg-bot-emulator`](../emulator): put your
bot in front of people — in docs, a playground, a Storybook — without a token
or a network. Rich messages, inline and reply keyboards, the Menu button with the bot's
commands, photos and documents, streamed drafts, reactions, replies and file
uploads work as in the Telegram client.

```tsx
import { createBot } from "@effect-ak/tg-bot"
import { makeTgBotEmulator } from "@effect-ak/tg-bot-emulator"
import { Chat, PhoneFrame, createEmulatorPort } from "@effect-ak/tg-bot-emulator-react"
import "@effect-ak/tg-bot-emulator-react/styles.css"

const emulator = makeTgBotEmulator()
await createBot()
  .command("/start", ({ ctx }) => ctx.reply("Hello!"))
  .run({ client: emulator.client })

const port = createEmulatorPort(emulator)

export const Demo = () => (
  <PhoneFrame>
    <Chat port={port} title="Demo bot" />
  </PhoneFrame>
)
```

## The port

`<Chat>` never touches the emulator: it talks to an `EmulatorPort` — chat
events in, user actions out (`sendMessage`, `tapButton`, `react`,
`deleteMessage`, `sendFile`, `sendInlineQuery`, `chooseInlineResult`), `getFile` for the photos it shows and the
documents it saves, and `widgetRequest` for HTML widgets. `createEmulatorPort(emulator)` is the port to an
emulator in the same thread. When the bot runs in a Web Worker, implement the
same interface over `postMessage`: the worker forwards the emulator's events
and performs the actions it receives. Besides the emulator's events a port may
send `bot_idle` (the bot finished an update: the chat stops showing "typing…")
and `action_error` (an action failed — the chat stops waiting; show it as you
like).

A new port is a new chat: `<Chat>` resets when the `port` prop changes.

## Pieces

- `<Chat port title status onRestart onNotice onEvent emptyHint startCommand quickReactions botUsername />`
  — with `botUsername`, typing `@<username> query` asks the bot inline and
  shows its results above the composer.
- `<PhoneFrame>` — an iPhone-like frame with a ticking clock; below 768 px wide
  it steps aside (`alwaysFramed` keeps it).
- `useChat(port)` — the chat state (`messages`, `draft`, `reactions`,
  `waiting`, `typing`) and the actions, for a UI of your own.
- `RichMessageView`, `renderRichText`, `renderEntities` — the renderers.

## HTML widgets

A message with a widget (Bot API 10.4) runs it in a sandboxed iframe —
an opaque origin with the network closed by a Content-Security-Policy — with a
shim of `window.TelegramWidget`: `chatData` / `publicData` and their change
events, `request()` through the port, `themeParams` and the `--tg-theme-*`
variables, `copyText`, `openLink`, `ready`. Not emulated: the wallet, previews
and forwards, haptics, background requests and rate limits, and the profile's
filtering of HTML and CSS.

## Styling

`styles.css` styles classes prefixed `tgc-`. Colors and fonts are custom
properties on `.tgc-chat` and `.tgc-phone` (`--tgc-accent`, `--tgc-bubble-out`,
`--tgc-wallpaper`, …): override them to restyle. The elements carry
`data-testid` attributes (`chat`, `message`, `keyboard-button`, `chat-input`, …)
for end-to-end tests.
