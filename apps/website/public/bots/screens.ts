import { createBot, defineScreens } from "@effect-ak/tg-bot"

// defineScreens: inline-keyboard navigation described as data.
// Tapping a button edits the SAME message in place; the "‹ Back"
// button is generated automatically from `parent`.
const screens = defineScreens({
  root: {
    text: "☕ <b>Neon Coffee</b>\nWhat would you like to know?",
    parse_mode: "HTML",
    buttons: [
      [
        { label: "📋 Menu", next: "menu" },
        { label: "🕐 Hours", next: "hours" }
      ],
      [
        {
          label: "⭐ Order of the day",
          // An action button runs a handler; the screen stays as is
          action: ({ ctx }) => ctx.reply("Today: flat white + banana bread 🍌")
        }
      ],
      [{ label: "🌐 Website", url: "https://tg-bot-sdk.website" }]
    ]
  },
  menu: {
    parent: "root",
    text: "Espresso — $3\nFlat white — $4.5\nFilter — $4",
    buttons: [[{ label: "🫘 This week's beans", next: "beans" }]]
  },
  beans: {
    parent: "menu",
    text: "Washed Ethiopia: bergamot, honey, a long clean finish."
  },
  hours: {
    parent: "root",
    text: "Mon–Fri 8:00–20:00\nSat–Sun 9:00–18:00"
  }
})

// The plugin wires /start, renders screens, and handles every tap.
export default createBot().use(screens)
