import { createBot, defineScreens } from "@effect-ak/tg-bot"

export const description =
  "Inline-keyboard UI declared as data: one message rewritten in place as you tap"

// The whole navigation as data. `next` is type-checked against the screen ids;
// Back buttons, edit-in-place and answer_callback_query are handled by the SDK.
const screens = defineScreens(
  {
    root: {
      text: "🏠 Main menu\n\nPick a section:",
      buttons: [
        [
          { label: "📋 Services", next: "services" },
          { label: "🕒 Hours", next: "hours" }
        ],
        [{ label: "☎️ Contacts", next: "contacts" }]
      ]
    },
    services: {
      text: "📋 Services\n\n• Consultation\n• Diagnostics\n• Follow-up visit",
      parent: "root",
      buttons: [
        {
          label: "📅 Book",
          action: ({ ctx }) =>
            ctx.answerCallbackQuery({
              text: "Booking is not available in the demo",
              show_alert: true
            })
        }
      ]
    },
    hours: {
      text: "🕒 Opening hours\n\nMon–Fri 9:00–18:00\nSat 10:00–14:00",
      parent: "root"
    },
    contacts: {
      text: "☎️ Contacts\n\n+1 555 0100\nhello@example.com",
      parent: "root",
      buttons: [{ label: "🌐 Website", url: "https://tg-bot-sdk.website" }]
    }
  },
  { command: false } // /start is owned by the home bot in this demo
)

export default createBot()
  .use(screens)
  .onMessage(({ fallback }) => [fallback(screens.open("root"))])
