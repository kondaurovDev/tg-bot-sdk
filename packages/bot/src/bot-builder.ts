/**
 * @module bot-builder
 * Fluent builder API for configuring a bot. Provides typed helper
 * factories (command, text, photo, etc.) and terminates with
 * {@link Bot.run} (polling) or {@link Bot.webhook} (webhook).
 */
import type {
  Message,
  CallbackQuery,
  InlineQuery,
  SharedWidgetQuery,
  Update,
  WidgetQuery
} from "@effect-ak/tg-bot-api"

import type {
  GuardedHandler,
  HandlerInput,
  HandlerOutput,
  AvailableUpdateTypes,
  UpdatePayload,
  BotLogger,
  HandleResult,
  ClientSource
} from "./types"
import { toUpdatesHandlers } from "./types"

import type { PollSettings } from "./polling"
import type { BotInstance, WebhookHandler } from "./run"
import { runBot, createWebhook } from "./run"

// ---------------------------------------------------------------------------
// Handler function shorthand
// ---------------------------------------------------------------------------

export type HandlerFn<U> = (input: HandlerInput<U>) => HandlerOutput

// ---------------------------------------------------------------------------
// Helper interfaces — injected into onXxx callbacks
// ---------------------------------------------------------------------------

export interface MessageHelpers {
  command: (cmd: string, handler: HandlerFn<Message>) => GuardedHandler<Message>
  text: (handler: HandlerFn<Message>) => GuardedHandler<Message>
  photo: (handler: HandlerFn<Message>) => GuardedHandler<Message>
  document: (handler: HandlerFn<Message>) => GuardedHandler<Message>
  sticker: (handler: HandlerFn<Message>) => GuardedHandler<Message>
  fallback: (handler: HandlerFn<Message>) => GuardedHandler<Message>
}

export interface CallbackQueryHelpers {
  data: (
    pattern: string | RegExp,
    handler: HandlerFn<CallbackQuery>
  ) => GuardedHandler<CallbackQuery>
  fallback: (handler: HandlerFn<CallbackQuery>) => GuardedHandler<CallbackQuery>
}

export interface InlineQueryHelpers {
  query: (pattern: string | RegExp, handler: HandlerFn<InlineQuery>) => GuardedHandler<InlineQuery>
  fallback: (handler: HandlerFn<InlineQuery>) => GuardedHandler<InlineQuery>
}

/** Helpers for `onWidgetQuery` / `onSharedWidgetQuery`: match on the request's `data`. */
export interface WidgetQueryHelpers<U extends WidgetQuery | SharedWidgetQuery> {
  data: (pattern: string | RegExp, handler: HandlerFn<U>) => GuardedHandler<U>
  fallback: (handler: HandlerFn<U>) => GuardedHandler<U>
}

export interface GenericHelpers<U> {
  fallback: (handler: HandlerFn<U>) => GuardedHandler<U>
}

// ---------------------------------------------------------------------------
// Registration input: callback with helpers, a guard, or a list of guards
// ---------------------------------------------------------------------------

export type HandlerRegistration<U, H> =
  | ((helpers: H) => GuardedHandler<U>[])
  | GuardedHandler<U>
  | GuardedHandler<U>[]

// ---------------------------------------------------------------------------
// Bot config for run / webhook
// ---------------------------------------------------------------------------

export type BotRunConfig = ClientSource & {
  poll?: Partial<PollSettings>
  onUpdate?: (update: Update) => void
  onHandleResult?: (result: HandleResult) => void
  logger?: BotLogger
}

export type BotWebhookConfig = ClientSource & {
  /** Secret token verified against `X-Telegram-Bot-Api-Secret-Token`; see `WebhookBotConfig`. */
  secret_token?: string
  onHandleResult?: (result: HandleResult) => void
  logger?: BotLogger
}

// ---------------------------------------------------------------------------
// Bot interface
// ---------------------------------------------------------------------------

export interface Bot {
  /**
   * Shortcut for the most common case — one command, one handler:
   * `bot.command("/start", ({ ctx }) => ctx.reply("Hi"))`.
   * Equivalent to `onMessage(({ command }) => [command(cmd, handler)])`.
   */
  command(cmd: string, handler: HandlerFn<Message>): Bot
  /** Shortcut: handle any text message (`onMessage(({ text }) => [text(handler)])`). */
  onText(handler: HandlerFn<Message>): Bot
  /**
   * Shortcut: handle a callback query whose `data` equals the string or
   * matches the RegExp (`onCallbackQuery(({ data }) => [data(pattern, handler)])`).
   */
  onCallback(pattern: string | RegExp, handler: HandlerFn<CallbackQuery>): Bot

  onMessage(input: HandlerRegistration<Message, MessageHelpers>): Bot
  onEditedMessage(input: HandlerRegistration<Message, GenericHelpers<Message>>): Bot
  onChannelPost(input: HandlerRegistration<Message, GenericHelpers<Message>>): Bot
  onEditedChannelPost(input: HandlerRegistration<Message, GenericHelpers<Message>>): Bot
  onBusinessMessage(input: HandlerRegistration<Message, GenericHelpers<Message>>): Bot
  onEditedBusinessMessage(input: HandlerRegistration<Message, GenericHelpers<Message>>): Bot
  onCallbackQuery(input: HandlerRegistration<CallbackQuery, CallbackQueryHelpers>): Bot
  onInlineQuery(input: HandlerRegistration<InlineQuery, InlineQueryHelpers>): Bot
  /**
   * Requests from widgets in messages sent by the bot (Bot API 10.4). A
   * handler that responds without `ctx.answerWidgetQuery` gets an empty
   * answer sent for it.
   */
  onWidgetQuery(input: HandlerRegistration<WidgetQuery, WidgetQueryHelpers<WidgetQuery>>): Bot
  /** Requests from forwarded copies of the bot's shared widgets. */
  onSharedWidgetQuery(
    input: HandlerRegistration<SharedWidgetQuery, WidgetQueryHelpers<SharedWidgetQuery>>
  ): Bot

  on<K extends AvailableUpdateTypes>(
    type: K,
    input: HandlerRegistration<UpdatePayload<K>, GenericHelpers<UpdatePayload<K>>>
  ): Bot

  /** Apply a plugin — a function that registers handlers and returns the bot (e.g. `defineScreens(...)`). */
  use(plugin: (bot: Bot) => Bot): Bot

  run(config: BotRunConfig): Promise<BotInstance>
  webhook(config: BotWebhookConfig): WebhookHandler
}

// ---------------------------------------------------------------------------
// Helper factories
// ---------------------------------------------------------------------------

function makeMessageHelpers(): MessageHelpers {
  return {
    command: (cmd, handler) => {
      // Accept "start" and "/START" alike; ctx.command is always "/lowercase".
      const expected = (cmd.startsWith("/") ? cmd : `/${cmd}`).toLowerCase()
      return {
        match: ({ ctx }) => ctx.command === expected,
        handle: handler
      }
    },
    text: (handler) => ({
      match: ({ payload }) => !!payload.text,
      handle: handler
    }),
    photo: (handler) => ({
      match: ({ payload }) => !!payload.photo,
      handle: handler
    }),
    document: (handler) => ({
      match: ({ payload }) => !!payload.document,
      handle: handler
    }),
    sticker: (handler) => ({
      match: ({ payload }) => !!payload.sticker,
      handle: handler
    }),
    fallback: (handler) => ({ handle: handler })
  }
}

function makeCallbackQueryHelpers(): CallbackQueryHelpers {
  return {
    data: (pattern, handler) => ({
      match: ({ payload }) =>
        typeof pattern === "string" ? payload.data === pattern : pattern.test(payload.data ?? ""),
      handle: handler
    }),
    fallback: (handler) => ({ handle: handler })
  }
}

function makeInlineQueryHelpers(): InlineQueryHelpers {
  return {
    query: (pattern, handler) => ({
      match: ({ payload }) =>
        typeof pattern === "string" ? payload.query === pattern : pattern.test(payload.query),
      handle: handler
    }),
    fallback: (handler) => ({ handle: handler })
  }
}

function makeWidgetQueryHelpers<
  U extends WidgetQuery | SharedWidgetQuery
>(): WidgetQueryHelpers<U> {
  return {
    data: (pattern, handler) => ({
      match: ({ payload }) =>
        typeof pattern === "string" ? payload.data === pattern : pattern.test(payload.data),
      handle: handler
    }),
    fallback: (handler) => ({ handle: handler })
  }
}

function makeGenericHelpers<U>(): GenericHelpers<U> {
  return {
    fallback: (handler) => ({ handle: handler })
  }
}

// ---------------------------------------------------------------------------
// resolve registration input (callback or direct array) into GuardedHandler[]
// ---------------------------------------------------------------------------

function resolve<U, H>(
  makeHelpers: () => H,
  input: HandlerRegistration<U, H>
): GuardedHandler<U>[] {
  if (typeof input === "function") {
    return input(makeHelpers())
  }
  return Array.isArray(input) ? input : [input]
}

// ---------------------------------------------------------------------------
// createBot
// ---------------------------------------------------------------------------

/** Guards registered so far, by update kind. */
type GuardTable<K extends AvailableUpdateTypes = AvailableUpdateTypes> = {
  [P in K]?: GuardedHandler<UpdatePayload<P>>[]
}

// Generic in the kind — a view of the table narrowed to `K` — so the guards
// written under a kind are checked against that kind's payload.
function appendGuards<K extends AvailableUpdateTypes>(
  table: GuardTable<K>,
  type: K,
  guards: GuardedHandler<UpdatePayload<K>>[]
): void {
  table[type] = [...(table[type] ?? []), ...guards]
}

export function createBot(): Bot {
  const table: GuardTable = {}

  function register<K extends AvailableUpdateTypes>(
    type: K,
    guards: GuardedHandler<UpdatePayload<K>>[]
  ): void {
    appendGuards(table, type, guards)
  }

  const bot: Bot = {
    command(cmd, handler) {
      return bot.onMessage(({ command }) => [command(cmd, handler)])
    },

    onText(handler) {
      return bot.onMessage(({ text }) => [text(handler)])
    },

    onCallback(pattern, handler) {
      return bot.onCallbackQuery(({ data }) => [data(pattern, handler)])
    },

    onMessage(input) {
      register("message", resolve(makeMessageHelpers, input))
      return bot
    },

    onEditedMessage(input) {
      register("edited_message", resolve(makeGenericHelpers<Message>, input))
      return bot
    },

    onChannelPost(input) {
      register("channel_post", resolve(makeGenericHelpers<Message>, input))
      return bot
    },

    onEditedChannelPost(input) {
      register("edited_channel_post", resolve(makeGenericHelpers<Message>, input))
      return bot
    },

    onBusinessMessage(input) {
      register("business_message", resolve(makeGenericHelpers<Message>, input))
      return bot
    },

    onEditedBusinessMessage(input) {
      register("edited_business_message", resolve(makeGenericHelpers<Message>, input))
      return bot
    },

    onCallbackQuery(input) {
      register("callback_query", resolve(makeCallbackQueryHelpers, input))
      return bot
    },

    onInlineQuery(input) {
      register("inline_query", resolve(makeInlineQueryHelpers, input))
      return bot
    },

    onWidgetQuery(input) {
      register("widget_query", resolve(makeWidgetQueryHelpers<WidgetQuery>, input))
      return bot
    },

    onSharedWidgetQuery(input) {
      register("shared_widget_query", resolve(makeWidgetQueryHelpers<SharedWidgetQuery>, input))
      return bot
    },

    on<K extends AvailableUpdateTypes>(
      type: K,
      input: HandlerRegistration<UpdatePayload<K>, GenericHelpers<UpdatePayload<K>>>
    ) {
      register(type, resolve(makeGenericHelpers<UpdatePayload<K>>, input))
      return bot
    },

    use(plugin) {
      return plugin(bot)
    },

    async run(config) {
      if (Object.keys(table).length === 0) {
        console.warn("No handlers are defined for bot")
      }
      return runBot({
        ...config,
        mode: "single",
        ...toUpdatesHandlers(table)
      })
    },

    webhook(config) {
      return createWebhook({
        ...config,
        ...toUpdatesHandlers(table)
      })
    }
  }

  return bot
}
