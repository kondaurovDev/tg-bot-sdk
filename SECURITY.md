# Security policy

## Reporting a vulnerability

Please report it privately, not in a public issue: open the repository's **Security** tab and choose [**Report a vulnerability**](https://github.com/kondaurovDev/tg-bot-sdk/security/advisories/new). The report stays between you and the maintainer until a fix is released.

Say which package and version is affected and how to reproduce the problem. A minimal bot or request that shows it is the fastest way to a fix.

You can expect a reply within a week. A confirmed vulnerability is fixed in a new release of the affected packages, with an advisory that credits you unless you prefer otherwise.

## Supported versions

Only the latest release of each package gets security fixes.

## What is in scope

The published packages: `@effect-ak/tg-bot-api`, `@effect-ak/tg-bot-client`, `@effect-ak/tg-bot` and `@effect-ak/tg-bot-emulator`. For example:

- a way past the webhook's secret token check;
- a bot token ending up in an error, a log line or a thrown message;
- an update or an API response that makes the client or the bot run something it should not.

## What is not

- **Advisories against development dependencies.** The published packages have no third-party runtime dependencies: they depend on each other and on nothing else. What the lockfile holds (the documentation site, the demo Worker, the test and build tools) is never installed by a user of the packages. Dependabot keeps it current.
- **The demo bot and the website.** Problems there are welcome as ordinary issues.
