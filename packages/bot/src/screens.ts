/**
 * @module screens
 * Declarative inline-keyboard navigation: describe screens as data
 * (text + buttons + parent), get a plugin that renders them, wires
 * `/start`, handles button taps (edit in place), Back and custom actions.
 *
 * ```ts
 * const screens = defineScreens({
 *   root:  { text: "Main menu", buttons: [[{ label: "Hours", next: "hours" }]] },
 *   hours: { text: "Mon–Fri 9–18", parent: "root" }
 * })
 * createBot().use(screens).webhook({ ... })
 * ```
 */
import type { CallbackQuery, InlineKeyboardButton, Message } from "@effect-ak/tg-bot-api"

import type { Bot } from "./bot-builder"
import type {
  BotResponse,
  GuardedHandler,
  HandlerInput,
  HandlerOutput,
  HandlerResult
} from "./types"

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type ParseMode = "HTML" | "MarkdownV2"

/** Handler input a screen sees: the `/start` message or the tapped callback query. */
export type ScreenInput = HandlerInput<Message | CallbackQuery>

/** A static value or a function of the current update. */
export type Resolvable<T> = T | ((input: ScreenInput) => T | PromiseLike<T>)

/** Navigate to another screen (edits the message in place). */
export interface ScreenButtonNext<K extends string> {
  readonly label: string
  readonly next: K
}

/** Open an external link. */
export interface ScreenButtonUrl {
  readonly label: string
  readonly url: string
}

/** Run a handler; whatever it returns is sent. The screen stays as is. */
export interface ScreenButtonAction {
  readonly label: string
  readonly action: (input: HandlerInput<CallbackQuery>) => HandlerOutput
}

export type ScreenButton<K extends string> =
  | ScreenButtonNext<K>
  | ScreenButtonUrl
  | ScreenButtonAction

/** Buttons as rows, or a flat list (one button per row). */
export type ScreenButtons<K extends string> =
  | readonly ScreenButton<K>[]
  | readonly (readonly ScreenButton<K>[])[]

export interface Screen<K extends string> {
  readonly text: Resolvable<string>
  readonly buttons?: Resolvable<ScreenButtons<K>>
  /** Adds a Back button leading here (unless `back` is disabled). */
  readonly parent?: K
  readonly parse_mode?: ParseMode
}

/**
 * Optional per-chat storage of the navigation stack. With a store, Back undoes
 * the last step (correct when a screen is reachable from several places);
 * without it, Back goes to the screen's static `parent`.
 */
export interface ScreenStore {
  get(chatId: number): Promise<readonly string[] | null | undefined>
  set(chatId: number, stack: readonly string[]): Promise<void>
}

export interface ScreensOptions<K extends string> {
  /** Screen shown on `/start`. Defaults to the first key. */
  readonly start?: K
  /** Command that opens `start`; `false` to register none. Default `"/start"`. */
  readonly command?: string | false
  /** Back button label, or `false` to never render Back. Default `"‹ Back"`. */
  readonly back?: string | false
  /** Rows appended to every screen (e.g. a "Talk to a human" link). */
  readonly footer?: ScreenButtons<K>
  /** Per-chat navigation stack — enables undo-style Back. */
  readonly store?: ScreenStore
  /** Called whenever a screen is shown; handy for analytics. */
  readonly onEnter?: (screen: K, input: ScreenInput) => void | PromiseLike<void>
  /** Prefix of generated `callback_data`. Default `"s:"`. Keep it short. */
  readonly prefix?: string
  /** Default parse mode for screen texts. */
  readonly parse_mode?: ParseMode
  /** Max depth of the stored navigation stack. Default 20. */
  readonly max_stack?: number
}

export interface RenderedScreen {
  readonly text: string
  readonly reply_markup: { readonly inline_keyboard: InlineKeyboardButton[][] }
  readonly parse_mode?: ParseMode
}

export interface Screens<K extends string> {
  /** Install into a bot: `createBot().use(screens)`. */
  (bot: Bot): Bot
  readonly ids: readonly K[]
  readonly start: K
  /** Render a screen into text + inline keyboard (Back resolved from `parent`). */
  render(id: K, input: ScreenInput): Promise<RenderedScreen>
  /**
   * Handler that opens a screen as a new message — for custom entry points:
   * `command("/menu", screens.open("root"))`.
   */
  open(id: K): (input: HandlerInput<Message>) => Promise<BotResponse>
  /** Message handlers (the start command). Use when composing by hand. */
  readonly messageHandlers: GuardedHandler<Message>[]
  /** Callback query handlers (navigation, back, actions). */
  readonly callbackHandlers: GuardedHandler<CallbackQuery>[]
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

const resolve = async <T>(value: Resolvable<T>, input: ScreenInput): Promise<T> =>
  typeof value === "function" ? (value as (i: ScreenInput) => T | PromiseLike<T>)(input) : value

const toRows = <K extends string>(buttons: ScreenButtons<K> | undefined): ScreenButton<K>[][] => {
  if (!buttons || buttons.length === 0) return []
  const first = buttons[0]
  return Array.isArray(first)
    ? (buttons as readonly (readonly ScreenButton<K>[])[]).map((r) => [...r])
    : [...(buttons as readonly ScreenButton<K>[])].map((b) => [b])
}

const chatIdOf = (input: ScreenInput): number | undefined => {
  const u = input.payload as { chat?: { id: number }; message?: { chat: { id: number } } }
  return u.chat?.id ?? u.message?.chat.id
}

// callback_data layout (kept short — Telegram allows 64 bytes):
//   <prefix>g:<from>:<to>      go to screen `to` (from `from`)
//   <prefix>b:<current>        back from `current`
//   <prefix>a:<screen>:<index> run action button #index of `screen`
const GO = "g:"
const BACK = "b:"
const ACTION = "a:"

export function defineScreens<K extends string>(
  screens: { readonly [P in K]: Screen<NoInfer<K>> },
  options: ScreensOptions<NoInfer<K>> = {}
): Screens<K> {
  const ids = Object.keys(screens) as K[]
  if (ids.length === 0) throw new Error("defineScreens: at least one screen is required")

  const start = options.start ?? ids[0]!
  const prefix = options.prefix ?? "s:"
  const backLabel = options.back === undefined ? "‹ Back" : options.back
  const command = options.command === undefined ? "/start" : options.command
  const maxStack = options.max_stack ?? 20
  const store = options.store

  const isId = (id: string): id is K => Object.prototype.hasOwnProperty.call(screens, id)

  // --- navigation stack (only with a store) ---------------------------------

  const readStack = async (chatId: number | undefined): Promise<K[]> =>
    store && chatId !== undefined ? ((await store.get(chatId)) ?? []).filter(isId) : []

  const writeStack = async (chatId: number | undefined, stack: K[]): Promise<void> => {
    if (store && chatId !== undefined) await store.set(chatId, stack.slice(-maxStack))
  }

  // --- rendering ------------------------------------------------------------

  const renderWithBack = async (
    id: K,
    input: ScreenInput,
    backTo: K | undefined
  ): Promise<RenderedScreen> => {
    const screen = screens[id]
    const [text, buttons] = await Promise.all([
      resolve(screen.text, input),
      resolve(screen.buttons, input)
    ])

    const rows: InlineKeyboardButton[][] = []
    const toButton = (b: ScreenButton<K>, index: number): InlineKeyboardButton => {
      if ("next" in b) return { text: b.label, callback_data: `${prefix}${GO}${id}:${b.next}` }
      if ("url" in b) return { text: b.label, url: b.url }
      return { text: b.label, callback_data: `${prefix}${ACTION}${id}:${index}` }
    }

    let index = 0
    for (const row of toRows(buttons)) {
      rows.push(row.map((b) => toButton(b, index++)))
    }
    if (backLabel !== false && backTo !== undefined) {
      rows.push([{ text: backLabel, callback_data: `${prefix}${BACK}${id}` }])
    }
    for (const row of toRows(options.footer)) {
      rows.push(row.map((b) => toButton(b, index++)))
    }

    const parse_mode = screen.parse_mode ?? options.parse_mode
    return {
      text,
      reply_markup: { inline_keyboard: rows },
      ...(parse_mode ? { parse_mode } : {})
    }
  }

  const render = (id: K, input: ScreenInput) => renderWithBack(id, input, screens[id].parent)

  /** Where Back from `id` leads: top of the stack, or the static parent. */
  const backTargetOf = (id: K, stack: readonly K[]): K | undefined =>
    store ? stack[stack.length - 1] : screens[id].parent

  // --- entry points ---------------------------------------------------------

  const enter = (id: K, input: ScreenInput) => options.onEnter?.(id, input)

  const open =
    (id: K) =>
    async (input: HandlerInput<Message>): Promise<BotResponse> => {
      await writeStack(chatIdOf(input), [])
      const rendered = await renderWithBack(id, input, undefined)
      await enter(id, input)
      return input.ctx.reply(rendered.text, {
        reply_markup: rendered.reply_markup,
        ...(rendered.parse_mode ? { parse_mode: rendered.parse_mode } : {})
      })
    }

  const show = async (
    id: K,
    input: HandlerInput<CallbackQuery>,
    stack: K[]
  ): Promise<BotResponse> => {
    const rendered = await renderWithBack(id, input, backTargetOf(id, stack))
    await enter(id, input)
    return input.ctx.editMessageText(rendered.text, {
      reply_markup: rendered.reply_markup,
      ...(rendered.parse_mode ? { parse_mode: rendered.parse_mode } : {})
    })
  }

  const onCallback = async (input: HandlerInput<CallbackQuery>): Promise<HandlerResult> => {
    const data = input.payload.data!.slice(prefix.length)
    const chatId = chatIdOf(input)

    if (data.startsWith(GO)) {
      const [from, to] = data.slice(GO.length).split(":")
      if (!to || !isId(to)) return show(start, input, [])
      const stack = await readStack(chatId)
      if (from && isId(from) && from !== to) stack.push(from)
      await writeStack(chatId, stack)
      return show(to, input, stack)
    }

    if (data.startsWith(BACK)) {
      const current = data.slice(BACK.length)
      const stack = await readStack(chatId)
      const target = isId(current) ? backTargetOf(current, stack) : undefined
      const popped = stack.slice(0, -1)
      await writeStack(chatId, popped)
      return show(target ?? start, input, popped)
    }

    if (data.startsWith(ACTION)) {
      const [screenId, indexRaw] = data.slice(ACTION.length).split(":")
      const index = Number(indexRaw)
      if (screenId && isId(screenId) && Number.isInteger(index)) {
        const buttons = await resolve(screens[screenId].buttons, input)
        const all = [...toRows(buttons).flat(), ...toRows(options.footer).flat()]
        const button = all[index]
        if (button && "action" in button) return button.action(input)
      }
      return input.ctx.answerCallbackQuery()
    }

    return show(start, input, [])
  }

  const messageHandlers: GuardedHandler<Message>[] =
    command === false ? [] : [{ match: ({ ctx }) => ctx.command === command, handle: open(start) }]

  const callbackHandlers: GuardedHandler<CallbackQuery>[] = [
    { match: ({ payload }) => payload.data?.startsWith(prefix) ?? false, handle: onCallback }
  ]

  const plugin = ((bot: Bot) =>
    bot.onMessage(messageHandlers).onCallbackQuery(callbackHandlers)) as Screens<K>

  return Object.assign(plugin, {
    ids,
    start,
    render,
    open,
    messageHandlers,
    callbackHandlers
  })
}
