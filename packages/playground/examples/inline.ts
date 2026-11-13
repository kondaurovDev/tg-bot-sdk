import { createBot } from "@effect-ak/tg-bot"

// Inline mode: in any chat, the user types the bot's @username and a query;
// the bot answers with results, and the one the user taps is sent to the chat
// "via @bot". In the playground the bot is @emulator_bot — type
// "@emulator_bot cat" in the message field.
// (For a real bot, turn inline mode on with @BotFather's /setinline.)

const ANIMALS = [
  { id: "cat", emoji: "🐈", name: "Cat", fact: "A cat sleeps 12-16 hours a day" },
  { id: "dog", emoji: "🐕", name: "Dog", fact: "A dog can learn over 150 words" },
  { id: "fox", emoji: "🦊", name: "Fox", fact: "A fox hears a watch ticking 40 m away" },
  { id: "owl", emoji: "🦉", name: "Owl", fact: "An owl turns its head 270°" },
  { id: "otter", emoji: "🦦", name: "Otter", fact: "Otters hold hands while they sleep" }
]

export default createBot()
  .command("/start", ({ ctx }) =>
    ctx.reply("Type “@emulator_bot cat” in the message field — results show up above it.")
  )
  .onInlineQuery(({ fallback }) => [
    fallback(({ payload, ctx }) => {
      const query = payload.query.trim().toLowerCase()
      const found = ANIMALS.filter(
        (a) => a.id.includes(query) || a.name.toLowerCase().includes(query)
      )
      return ctx.call("answer_inline_query", {
        inline_query_id: payload.id,
        results: found.map((a) => ({
          type: "article",
          id: a.id,
          title: `${a.emoji} ${a.name}`,
          description: a.fact,
          input_message_content: {
            message_text: `${a.emoji} <b>${a.name}</b>. ${a.fact}.`,
            parse_mode: "HTML"
          }
        }))
      })
    })
  ])
