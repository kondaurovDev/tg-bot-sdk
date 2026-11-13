import { createBot } from "@effect-ak/tg-bot"

// Rich messages (Bot API 10.1+): structured blocks instead of plain
// text — headings, tables, code, dividers, footers, styled buttons.
export default createBot()
  .command("/start", ({ ctx }) => ctx.reply("Send /report to get a rich message."))
  .command("/report", ({ payload, ctx }) =>
    ctx.call("send_rich_message", {
      chat_id: payload.chat.id,
      rich_message: {
        blocks: [
          { type: "heading", size: 1, text: "Weekly report" },
          {
            type: "paragraph",
            text: ["Deploys are ", { type: "bold", text: "green" }, " across the board."]
          },
          {
            type: "table",
            is_bordered: true,
            cells: [
              [
                { align: "left", valign: "top", is_header: true, text: "Service" },
                { align: "right", valign: "top", is_header: true, text: "Uptime" }
              ],
              [
                { align: "left", valign: "top", text: "api" },
                { align: "right", valign: "top", text: "99.99%" }
              ],
              [
                { align: "left", valign: "top", text: "bot" },
                { align: "right", valign: "top", text: "100%" }
              ]
            ]
          },
          { type: "pre", language: "ts", text: 'const status: "ok" = "ok"' },
          { type: "divider" },
          {
            type: "buttons",
            buttons: [
              { text: "Approve", style: "success", callback_data: "report:approve" },
              { text: "Reject", style: "danger", callback_data: "report:reject" }
            ]
          },
          { type: "footer", text: "generated in the playground" }
        ]
      }
    })
  )
  .onCallback(/^report:/, ({ payload, ctx }) =>
    ctx.reply(payload.data === "report:approve" ? "Approved ✅" : "Rejected ❌")
  )
