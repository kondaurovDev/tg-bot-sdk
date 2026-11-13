---
paths:
  - "packages/playground/**"
---

# `packages/playground`: the website's playground

- `<Playground>` (`src/playground.tsx`): Monaco on the left, on the right the emulator chat (`<Chat>` from `emulator-react`) or the real-bot panel, the console below. Private, never published.
- Ships as source (`exports` point at `src/`): the website's Vite compiles it, resolving `?raw` imports (the examples, the SDK's `.d.ts` for Monaco) and the worker (`new URL("./bot-worker.ts", import.meta.url)`). It has no build step; it typechecks and tests on its own.
- The bot runs in a Web Worker (`src/bot-worker.ts`), one per run: `src/bot-runner.ts` starts it and hands the chat a new `EmulatorPort` over `postMessage`. Messages are typed in `src/protocol.ts`.
- The examples are `examples/*.ts`, typechecked with the package; `src/examples.ts` lists them. A new example also gets a case in the website's smoke test (`apps/website/tests/e2e/playground.ts`).
- Styles are plain CSS (`src/styles.css`, classes prefixed `pg-`), importing the chat's. No Tailwind.
- localStorage keys (`src/storage.ts`) are the ones the old Alpine playground used: visitors keep their edits and token.
