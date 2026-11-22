import { createBot } from "@effect-ak/tg-bot"

import { escapeHtml } from "./html"

export const description =
  "Replies with the raw JSON of whatever you send: ids, file ids, entities, forward origins"

/** A message holds 4096 UTF-16 code units; the rest is left for the note below the JSON. */
export const JSON_LIMIT = 3500

/** The update's payload as Telegram sent it, pretty-printed in a code block. */
export const inspect = (payload: unknown): string => {
  const json = JSON.stringify(payload, null, 2)
  // A cut between the halves of a surrogate pair would leave half an emoji: drop it
  const shown = json.slice(0, JSON_LIMIT).replace(/[\uD800-\uDBFF]$/, "")
  const rest = json.length - shown.length
  const note = rest > 0 ? `\n… ${rest} more characters` : ""
  return `<pre language="json">${escapeHtml(shown)}</pre>${note}`
}

// Any message at all: a text, a photo, a sticker, a forward, a contact
export default createBot().onMessage(({ fallback }) => [
  fallback(({ payload, ctx }) =>
    ctx.reply(inspect(payload), {
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true }
    })
  )
])
