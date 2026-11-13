---
paths:
  - "apps/website/**"
---

# `apps/website`: the docs site

- Astro + Starlight documentation site, https://tg-bot-sdk.website. Deployed by `.github/workflows/deploy-website.yml`.
- The playground is `packages/playground`; `src/pages/playground.astro` only mounts it as a React island (`client:only`). Alpine is left for the API reference's "try it" widget (`src/api-runner.ts`), which the codegen embeds in the method pages.
- `/llms.txt` and `/llms-full.txt` are generated from the guide pages by `src/pages/llms*.txt.ts` — a new guide page shows up there without editing them.
- The API reference pages (`src/content/docs/api/types/`) and `public/bot-api.json`, `public/mini-app.json` are written by the `api` codegen and not tracked; `src/data/bot-api-stats.json` and the counts in `src/content/docs/faq.mdx` are tracked and rewritten by it.
- The dev server runs under procdeck (`procdeck.config.json`, proc `website`).
