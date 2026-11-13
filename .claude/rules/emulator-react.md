---
paths:
  - "packages/emulator-react/**"
---

# `packages/emulator-react`: the chat UI

- React components over the emulator: `<Chat>`, `<PhoneFrame>`, `useChat`, the rich message and entity renderers. Private for now (`"private": true`); it becomes public by dropping that flag and adding a changeset.
- The boundary is `EmulatorPort` (`src/port.ts`): chat events in, user actions out. The chat never imports emulator internals — only `@effect-ak/tg-bot-emulator`'s public types, through `dist/`. `createEmulatorPort` is the same-thread port; a worker port (the website's) implements the same interface.
- State is a reducer (`chatReducer` in `src/use-chat.ts`) folded from port events; components render from it.
- Styles are plain CSS (`src/styles.css`, copied to `dist/styles.css` by the build), every class prefixed `tgc-`, colors as custom properties. No Tailwind in the package.
- Keep the `data-testid` attributes: the website's simulator smoke test (`apps/website/tests/e2e/playground.ts`) finds the chat by them.
- Tests run in jsdom against a real emulator and a real bot (`@effect-ak/tg-bot` dev dependency, through its `dist/`).
