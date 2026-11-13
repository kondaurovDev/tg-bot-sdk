---
name: playground-sim
description: Click through the website playground in the iOS simulator's Safari — run the smoke test over every example, or drive the page step by step to reproduce a bug and look at it. Use after changing the playground (packages/playground and its examples), the chat (packages/emulator-react), or the emulator the playground runs; when asked to check how the playground works on a phone or tablet; and when a playground bug needs reproducing.
---

# The playground in the simulator

The page is driven through Safari's Web Inspector by the garage repo's driver,
`~/Projects/garage/tools/sim` (`web.ts` CLI, `src/web/driver.ts` module; its
README has every command). Input goes through the DOM: a tap is the element's
`click()`, typing sets the value and fires `input`.

## Before

- Dev server: procdeck proc `website`. Its address is the proc's `url` in
  `procdeck status --json` — procdeck's stable proxy port, which the smoke
  test reads by itself. Astro's `dev` daemonizes, so the proc shows `exited 0`
  while the server runs; if the URL does not answer, `procdeck restart website`.
- The playground and its worker import the SDK packages' `dist/` (the
  playground itself is compiled from source): after changing
  `packages/*`, rebuild that package (`../../node_modules/.bin/tsup` in it)
  before looking.
- A booted simulator (`xcrun simctl list devices booted`). With several, pass
  `@ipad` / `@iphone` — otherwise the driver takes the first.
- Both commands below talk to CoreSimulator, which the Bash sandbox denies:
  run them as plain commands outside it.

## Smoke test

```sh
node apps/website/tests/e2e/playground.ts @ipad            # every example
node apps/website/tests/e2e/playground.ts @ipad rich dice  # some
```

Each example is picked, sent its typical input, and its replies asserted
(buttons, streaming draft, edit in place, reactions, documents). A failure
prints the check and a screenshot path. A new example in `public/bots` gets a
case in `examples` there.

## Step by step

```sh
T=~/Projects/garage/tools/sim/web.ts
node $T @ipad start "$(procdeck status --json | jq -r '.procs[] | select(.id == "website") | .url')" --fresh
node $T @ipad tap "#example-picker" && node $T @ipad tap '[data-testid="example-option"][data-example="rich.ts"]'
node $T @ipad type "#chat-input" "/report" && node $T @ipad key enter
node $T @ipad tap 'button[data-callback="report:approve"]'
node $T @ipad eval '[...document.querySelectorAll("[data-testid=message][data-from=bot]")].map((m) => m.innerText)'
node $T @ipad shot /private/tmp/claude-501/playground.png   # then Read it
node $T @ipad stop
```

The markup's hooks (`#x` is `[data-testid="x"]`):

- chat: `chat` (`data-bot` idle/running/error, `data-busy` true/false), `chat-input`, `chat-send`, `chat-attach`, `chat-start`, `chat-restart`, `chat-draft`, `chat-typing`
- messages: `message` (`data-from` bot/user, `data-message-id`), `keyboard-button`, `reaction`, `message-menu`; rich message buttons are `button[data-callback="…"]`
- editor: `example-picker` (`data-example` = the active file), `example-search`, `example-option` (`data-example`), `editor`
- header and the rest: `mode-virtual`, `mode-real`, `run`, `connect`, `console-toggle` (`data-errors`), `console-logs`, `console-log` (`data-level`), `toast` (`data-type`)

State lives in React: read it from the DOM — the chat's
`[data-testid="chat"]` carries `data-bot` and `data-busy`, the console's
entries are `[data-testid="console-log"]` (open it with `#console-toggle`).

## Real touches

The driver's `tap` is a DOM `click()`. Long presses, double taps and
"tap outside" need real touches through AXe (`/opt/homebrew/bin/axe`), at
screen points: the page's client coordinates plus the web view's offset
(62 pt from the top on the iPhone 17 Pro Max, measure it with a screenshot).
Use `axe touch -x X -y Y --down --up [--delay 0.8] --udid <udid>`: `axe tap`
does not reach Safari's web content. Two AXe calls land several hundred ms
apart — too slow for a double tap.

## Pitfalls

- `text=<words>` matches the Monaco editor too — an example's source holds
  the same words as its buttons and replies. Use the hooks above.
- Safari keeps old worker modules across a reload: after a rebuild, `start
--fresh` (it also resets the remembered example to Hello, world).
- `wait "#chat"` is true while the bot is still starting; wait for
  `[data-testid="chat"][data-bot="running"][data-busy="false"]` before sending.
- The bottom bar over the editor is Astro's dev toolbar, not the playground.
