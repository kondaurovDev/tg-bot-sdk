---
"@effect-ak/tg-bot-api": patch
"@effect-ak/tg-bot-client": patch
"@effect-ak/tg-bot": patch
"@effect-ak/tg-bot-emulator": patch
---

Packaging only, no change in behaviour or types.

- The packages are built with tsdown and TypeScript 7 instead of tsup and TypeScript 5.9. The published files and their exports, at runtime and in the declarations, are the same as in 1.14.0.
- Every package ships the MIT `LICENSE` file; the `license` field already said MIT.
- `@effect-ak/tg-bot-client` no longer ships its sources, tests and configs: its tarball is `dist/`, the readme and the license, like the other packages.
- `package.json` gains a `bugs` link and a few more search keywords.
