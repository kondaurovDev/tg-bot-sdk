# Contributing

Bug reports, ideas and pull requests are welcome. For anything larger than a fix, open an issue first so the approach can be agreed before you write the code.

## Setup

You need Node.js 24 and [pnpm](https://pnpm.io) (the version in `packageManager`; `corepack enable` picks it up).

```bash
pnpm install
pnpm build        # codegen, then every package
pnpm typecheck
pnpm test
pnpm lint
pnpm format:check # pnpm format writes
```

The packages resolve each other through `dist/`, so after changing one, rebuild it before testing a package that depends on it. Order: `api` ← `client` ← `bot`, `emulator`.

## Where things are

| Path                | What it is                                                           |
| ------------------- | -------------------------------------------------------------------- |
| `packages/api`      | Types generated from the Telegram docs, and the codegen that does it |
| `packages/client`   | The HTTP client                                                      |
| `packages/bot`      | The bot framework                                                    |
| `packages/emulator` | The in-memory Bot API for tests                                      |
| `packages/e2e`      | The generated types checked against the real Bot API                 |
| `apps/website`      | The documentation site and the playground                            |
| `apps/example`      | The live demo bot                                                    |

## Rules worth knowing before you start

- **Do not edit generated files** (`packages/api/src/specification/`). A wrong type is fixed in the scraper (`packages/api/codegen/scrape/`, overrides in `overrides.ts`), and the types mirror Telegram one to one: no aliases, no renames.
- **No runtime dependencies** in the published packages, and native `fetch` only.
- **Errors are values**: tagged unions (`{ ok: false, error }`), not exceptions.
- **A bot needs no token to be tested.** Run it against the emulator: `test/` in `packages/bot` and `apps/example` shows how.
- **A webhook must be verifiable**: no code path may process an update without checking the secret token.
- Formatting is `oxfmt` (no semicolons, no trailing commas), linting is `oxlint`. `packages/*/src` has no type assertions, `any` or non-null `!`.

## Pull requests

- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org): `fix(bot): …`, `feat(client): …`, `docs: …`.
- A change to a published package needs a changeset: run `pnpm changeset`, pick the packages and the bump, and describe the change for the people who use the package. Commit the file it creates.
- Add a test for what you fix or add.
- CI runs the build, the format and lint checks, the typecheck and the tests; all of them must pass.

Releases are made by CI from the changesets. Do not bump versions or publish by hand.

## Security

Report a vulnerability privately: see [SECURITY.md](SECURITY.md).
