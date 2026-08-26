---
"@effect-ak/tg-bot": minor
"@effect-ak/tg-bot-client": minor
---

Re-export the lower-level packages under subpaths, so a project only needs one entry in `package.json`.

```typescript
import { createBot } from "@effect-ak/tg-bot"
import type { Message, Update } from "@effect-ak/tg-bot/api"
import { makeTgBotClient } from "@effect-ak/tg-bot/client"

// client-only projects
import type { Api } from "@effect-ak/tg-bot-client/api"
```

The subpaths re-export the same declarations rather than bundling copies of them, so `@effect-ak/tg-bot-api` and `@effect-ak/tg-bot-client` remain installable on their own and their types stay interchangeable with the ones reached through a subpath.
