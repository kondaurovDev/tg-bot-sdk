import { createWebhook } from "@effect-ak/tg-bot"

const token = process.env.TOKEN

if (!token) {
  throw new Error("TOKEN environment variable is required")
}

const GITHUB_URL = "https://github.com/kondaurovDev/tg-bot-sdk"
const NPM_URL = "https://www.npmjs.com/package/@effect-ak/tg-bot"

const startMessage = `
Welcome! I'm a demo bot for effect-ak/tg-bot library.

This bot runs on Vercel serverless and showcases the library features.

Commands:
/source - GitHub repository
/install - Quick start guide
/example - See this bot's code
/features - Library features
/dice - Roll a dice (demo)

Or send me math like: 2 + 2 + 3
`.trim()

const installMessage = `
Quick Start:

<code>npm install @effect-ak/tg-bot</code>

<pre language="typescript">import { createWebhook } from "@effect-ak/tg-bot"

const bot = createWebhook({
  bot_token: process.env.TOKEN,
  on_message: [
    {
      match: ({ ctx }) =&gt; ctx.command === "/start",
      handle: ({ ctx }) =&gt; ctx.reply("Hello!")
    }
  ]
})</pre>

Full docs: ${GITHUB_URL}
`.trim()

const featuresMessage = `
Features:

- Type-safe Telegram Bot API
- Webhook & polling support
- Guard-based message handlers
- Built on Effect ecosystem
- Easy Vercel/serverless deployment
- Zero dependencies (except Effect)

GitHub: ${GITHUB_URL}
npm: ${NPM_URL}
`.trim()

const exampleMessage = `
This bot's source code:

${GITHUB_URL}/blob/main/example/api/vercel-tg-webhook.ts

The entire bot is ~60 lines of TypeScript!
`.trim()

const bot = createWebhook({
  bot_token: token,

  on_message: [
    {
      match: ({ ctx }) => ctx.command === "/start",
      handle: ({ ctx }) => ctx.reply(startMessage)
    },
    {
      match: ({ ctx }) => ctx.command === "/source",
      handle: ({ ctx }) =>
        ctx.reply(`GitHub: ${GITHUB_URL}\n\nStar the repo if you find it useful!`, {
          link_preview_options: { is_disabled: true }
        })
    },
    {
      match: ({ ctx }) => ctx.command === "/install",
      handle: ({ ctx }) =>
        ctx.reply(installMessage, {
          parse_mode: "HTML",
          link_preview_options: { is_disabled: true }
        })
    },
    {
      match: ({ ctx }) => ctx.command === "/features",
      handle: ({ ctx }) =>
        ctx.reply(featuresMessage, {
          link_preview_options: { is_disabled: true }
        })
    },
    {
      match: ({ ctx }) => ctx.command === "/example",
      handle: ({ ctx }) =>
        ctx.reply(exampleMessage, {
          link_preview_options: { is_disabled: true }
        })
    },
    {
      match: ({ ctx }) => ctx.command === "/dice",
      handle: ({ ctx }) => ctx.reply(`You rolled: ${Math.floor(Math.random() * 6) + 1}`)
    },
    {
      match: ({ update }) => update.text?.includes("+") ?? false,
      handle: ({ update, ctx }) => {
        const nums = update.text!.match(/\d+/g)
        if (!nums) return ctx.reply("No numbers found")
        const sum = nums.reduce((acc, n) => acc + parseInt(n), 0)
        return ctx.reply(`Sum: ${sum}`)
      }
    },
    {
      match: ({ update }) => !!update.text,
      handle: ({ ctx }) => ctx.reply("Send /start to see available commands")
    }
  ],

  on_callback_query: {
    handle: ({ update, ctx }) => {
      console.log("Callback query:", update.data)
      return ctx.reply(`Button: ${update.data}`)
    }
  }
})

type VercelRequest = {
  method?: string
  body: unknown
}

type VercelResponse = {
  status: (code: number) => {
    send: (body: string) => void
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed")
  }

  try {
    await bot.handleUpdate(req.body)
    res.status(200).send("ok")
  } catch (error) {
    console.error("Webhook error", error)
    res.status(500).send("error")
  }
}
