/**
 * Tic-tac-toe in an HTML widget (Bot API 10.4). The board is drawn inside the
 * message; a tap sends a request to the bot, which plays its move, answers
 * with the new state (so the widget redraws at once) and saves it as the
 * message's chat state.
 *
 * State is a 10-character string: nine cells (`x` you, `o` the bot, `-`
 * empty) and the status (`p` playing, `x` / `o` won, `d` draw). A request is
 * `n` (new game) or `m<cell><board>`: the widget sends the board it shows,
 * so this stateless Worker needs no storage. That is fine for a game against
 * the bot — cheating only cheats yourself; a game between two people would
 * keep the board on the server.
 */
import { BotResponse, createBot } from "@effect-ak/tg-bot"
import type { ClientErrorReason } from "@effect-ak/tg-bot-client"

export const description =
  "Tic-tac-toe against the bot, played inside an HTML widget (Bot API 10.4)"

export const NEW_GAME = "---------p"

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
] as const

const winner = (board: string): "x" | "o" | undefined => {
  for (const [a, b, c] of LINES) {
    const mark = board[a]
    if ((mark === "x" || mark === "o") && mark === board[b] && mark === board[c]) return mark
  }
  return undefined
}

const statusOf = (board: string): string => winner(board) ?? (board.includes("-") ? "p" : "d")

const place = (board: string, cell: number, mark: "x" | "o") =>
  board.slice(0, cell) + mark + board.slice(cell + 1)

const free = (board: string) => [...board].flatMap((c, i) => (c === "-" ? [i] : []))

/** Win if it can, block if it must, else center, a corner, an edge — beatable, on purpose. */
export const botMove = (board: string): number => {
  const cells = free(board)
  const completing = (mark: "x" | "o") => cells.find((i) => winner(place(board, i, mark)) === mark)
  return (
    completing("o") ??
    completing("x") ??
    [4, 0, 2, 6, 8, 1, 3, 5, 7].find((i) => cells.includes(i)) ??
    cells[0] ??
    0
  )
}

/** Apply a widget request; `undefined` for a request that is not a legal move. */
export const play = (data: string): string | undefined => {
  if (data === "n") return NEW_GAME
  const match = /^m([0-8])([xo-]{9})$/.exec(data)
  if (!match?.[1] || !match[2]) return undefined
  const cell = Number(match[1])
  let board = match[2]
  const xs = [...board].filter((c) => c === "x").length
  const os = [...board].filter((c) => c === "o").length
  if (xs !== os || statusOf(board) !== "p" || board[cell] !== "-") return undefined
  board = place(board, cell, "x")
  if (statusOf(board) === "p") board = place(board, botMove(board), "o")
  return board + statusOf(board)
}

/**
 * The widget: one HTML document, no network. It renders the state from
 * `TelegramWidget.chatData`, sends a request on a tap (synchronously, in the
 * tap handler, as widgets require) and redraws from the answer.
 */
export const WIDGET_HTML = `<style>
body{margin:0;padding:12px 12px max(12px,env(safe-area-inset-bottom));font:15px system-ui,sans-serif}
.g{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:240px;margin:0 auto}
.g button{aspect-ratio:1;padding:0;border:0;border-radius:12px;font-size:34px;font-weight:700;background:var(--tg-theme-secondary-bg-color);color:var(--tg-theme-text-color)}
.g .x{color:var(--tg-theme-button-color)}
.g .o{color:var(--tg-theme-destructive-text-color)}
.g .w{background:var(--tg-theme-button-color);color:var(--tg-theme-button-text-color)}
p{margin:10px 0 8px;text-align:center;color:var(--tg-theme-hint-color)}
#n{display:block;margin:0 auto}
</style>
<div class="g" id="g"></div><p id="s"></p><button id="n">New game</button>
<script>
const W=TelegramWidget,g=document.getElementById("g"),s=document.getElementById("s");
const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const T={p:"Your move — you are ✕",x:"You win! 🎉",o:"I win 🤖",d:"Draw 🤝"};
let st=W.chatData||"${NEW_GAME}",busy=false;
const line=b=>L.find(l=>b[l[0]]!="-"&&b[l[0]]==b[l[1]]&&b[l[0]]==b[l[2]])||[];
function draw(){const b=st.slice(0,9),w=line(b);g.textContent="";
for(let i=0;i<9;i++){const c=document.createElement("button");c.textContent=b[i]=="x"?"✕":b[i]=="o"?"◯":"";
c.className=(b[i]=="-"?"":b[i])+(w.includes(i)?" w":"");c.disabled=busy||st[9]!="p"||b[i]!="-";
c.onclick=()=>ask("m"+i+b);g.appendChild(c)}
s.textContent=busy?"…":T[st[9]]||""}
function ask(d){const r=W.request(d);busy=true;draw();
r.then(a=>{if(a.result&&a.result.length==10)st=a.result},e=>{s.textContent="Error: "+e.code}).finally(()=>{busy=false;draw()})}
document.getElementById("n").onclick=()=>ask("n");
W.onEvent("chatDataChanged",()=>{st=W.chatData||st;draw()});
draw();W.ready()
</script>`

export const PLAYGROUND_URL = "https://tg-bot-sdk.website/playground/?example=widget"

/** The reply when Telegram does not take the widget. */
export const widgetRefused = (error: ClientErrorReason): string => {
  const reason = error._tag === "NotOkResponse" ? (error.details ?? error._tag) : error._tag
  return (
    `Telegram didn't take the widget (${reason.replace(/^Bad Request: /, "")}). ` +
    "HTML widgets (Bot API 10.4) are still rolling out — try again later, " +
    `or play the same game in the playground: ${PLAYGROUND_URL}`
  )
}

export default createBot()
  .onMessage(({ fallback }) => [
    fallback(({ ctx }) =>
      BotResponse.make({
        type: "widget",
        html: WIDGET_HTML,
        chat_data: NEW_GAME,
        allow_queries: true,
        caption: "Tic-tac-toe inside a widget. Tap a cell — you play ✕."
      })
        // Telegram may refuse widgets (they are still rolling out): say so
        // instead of staying silent, and point to where the game runs anyway
        .orElse((error) => ctx.reply(widgetRefused(error)))
    )
  ])
  .onWidgetQuery(({ fallback }) => [
    fallback(({ payload, ctx }) => {
      const next = play(payload.data)
      if (!next) return ctx.answerWidgetQuery("invalid move")
      // Answer first so the widget redraws at once, then save the state on the message
      return [ctx.answerWidgetQuery(next), ctx.editWidgetData({ chat_data: next })]
    })
  ])
