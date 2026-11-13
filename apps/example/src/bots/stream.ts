/**
 * Streams its replies the way AI assistants do (`ctx.stream`, Bot API 9.3+
 * drafts): a "Thinking…" placeholder, then the answer typed in word by word,
 * then the final message. The answers are fixed — no model behind it — and
 * picked by a keyword in your question.
 */
import { createBot } from "@effect-ak/tg-bot"

export const description =
  "Answers like an AI assistant: “Thinking…”, then the reply streams in word by word (fixed answers, no LLM)"

interface Answer {
  readonly match: RegExp
  readonly text: string
}

export const ANSWERS: readonly Answer[] = [
  {
    match: /install|start|setup|begin/i,
    text: 'Install the package with npm install @effect-ak/tg-bot, then build a bot with createBot(): register handlers such as .command("/start", …) and call .run({ bot_token }) for long polling or .webhook({ bot_token, secret_token }) for a webhook. That is the whole setup — no framework, no runtime dependencies.'
  },
  {
    match: /webhook|worker|cloudflare|deploy/i,
    text: "I am a webhook bot myself: a Cloudflare Worker that receives updates over HTTPS. createWebhook verifies Telegram's secret token in constant time, parses the update and runs your handlers. Deploying is wrangler deploy plus one set_webhook call, which handler.setWebhook makes with the same secret."
  },
  {
    match: /widget|game|tic|tac/i,
    text: "Widgets arrived in Bot API 10.4: a small HTML document drawn inside a message, running offline in a sandbox. It talks to the bot with short requests; the bot answers with answerWidgetQuery and changes the widget's state with editMessageWidgetData. Open /demo and pick the tic-tac-toe bot to play one."
  },
  {
    match: /test|emulator|mock/i,
    text: "Bots built with this SDK can be tested without a token or network: @effect-ak/tg-bot-emulator is an in-memory Bot API. Pass emulator.client to bot.run(), then act as the user with sendMessage, tapButton or widgetRequest, and assert on what the bot sent."
  },
  {
    match: /stream|ai|llm|draft|typing/i,
    text: "What you are watching is ctx.stream: it sends a Thinking placeholder, then a send_message_draft for every chunk, so the text grows in place, and finishes with a normal message. Give it a string, an array or an async iterable — an LLM token stream fits right in."
  }
]

const FALLBACK =
  "I can tell you about installing the SDK, webhooks, widgets, testing with the emulator, or this streaming itself. Ask about one of them — for example: how do I test my bot?"

export const answerFor = (question: string): string =>
  ANSWERS.find((a) => a.match.test(question))?.text ?? FALLBACK

/** `interval_ms` paces the animation; the tests pass 0. */
export const makeStreamBot = (options: { interval_ms?: number } = {}) =>
  createBot().onMessage(({ text, fallback }) => [
    text(({ payload, ctx }) =>
      ctx.stream(answerFor(payload.text ?? ""), { interval_ms: options.interval_ms ?? 60 })
    ),
    fallback(({ ctx }) =>
      ctx.reply("Ask me something in text — about installing, webhooks, widgets or tests.")
    )
  ])

export default makeStreamBot()
