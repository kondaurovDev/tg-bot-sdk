import { createBot } from "@effect-ak/tg-bot"

// ctx.stream sends the reply the way AI bots do (Bot API 9.3+):
// a "Thinking…" placeholder, then an animated draft that grows with
// every chunk, then the final message once the stream ends.

const STORY =
  "Streaming replies show up as live drafts: the bubble updates in " +
  "place while the text is still being generated, and turns into a " +
  "regular message at the end. Plug an LLM token stream into " +
  "ctx.stream and you get a ChatGPT-style bot in Telegram."

// Any AsyncIterable<string> works — e.g. an LLM SDK stream.
async function* answer(prompt: string) {
  yield `You said: "${prompt}".\n\n`
  const words = "Imagine these words arriving one by one from a model — that's all it takes.".split(
    /(?<=\s)/
  )
  for (const word of words) yield word
}

export default createBot()
  .command("/start", ({ ctx }) =>
    ctx.reply("I stream my answers like an AI bot. Try /story, or just type anything.")
  )
  .command("/story", ({ ctx }) => ctx.stream(STORY, { interval_ms: 120 }))
  .onText(({ payload, ctx }) => ctx.stream(answer(payload.text ?? ""), { interval_ms: 100 }))
