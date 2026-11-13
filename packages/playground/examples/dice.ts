import { createBot, type BotContext, type BotResponse } from "@effect-ak/tg-bot"

// A tiny casino: chat actions, dice, and inline buttons.
export default createBot()
  .command("/start", ({ ctx }) =>
    ctx.reply("🎰 Feeling lucky? Send /roll", {
      reply_markup: { inline_keyboard: [[{ text: "🎲 Roll", callback_data: "roll" }]] }
    })
  )
  .command("/roll", ({ payload, ctx }) => roll(payload.chat.id, ctx))
  .onCallback("roll", ({ payload, ctx }) => roll(payload.message!.chat.id, ctx))

function roll(chat_id: number, ctx: BotContext): BotResponse[] {
  return [
    // "typing…" in the chat header while the bot "thinks"
    ctx.call("send_chat_action", { chat_id, action: "typing" }),
    ctx.call("send_dice", { chat_id }),
    ctx.call("send_message", {
      chat_id,
      text: "6 wins. Anything else — try again 😉",
      reply_markup: { inline_keyboard: [[{ text: "🎲 Roll again", callback_data: "roll" }]] }
    })
  ]
}
