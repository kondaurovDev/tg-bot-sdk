/**
 * @module bot-builder
 * Fluent builder API for configuring a bot. Provides typed helper
 * factories (command, text, photo, etc.) and terminates with
 * {@link Bot.run} (polling) or {@link Bot.webhook} (webhook).
 */
import type { Message, CallbackQuery, InlineQuery, Update } from "@effect-ak/tg-bot-api"

import type {
  BotUpdatesHandlers,
  GuardedHandler,
  HandlerInput,
  AvailableUpdateTypes,
  BotLogger,
  HandleResult
} from "./types"

import type { PollSettings } from "./polling"
import type { BotInstance, WebhookHandler } from "./run"
import { runBot, createWebhook } from "./run"

// ---------------------------------------------------------------------------
// Handler function shorthand
// ---------------------------------------------------------------------------

type HandlerFn<U> = (
  input: HandlerInput<U>
) => import("./types").BotResponse | PromiseLike<import("./types").BotResponse>

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

export interface GenericHelpers<U> {
  fallback: (handler: HandlerFn<U>) => GuardedHandler<U>
}

// ---------------------------------------------------------------------------
// Registration input: callback with helpers OR direct array
// ---------------------------------------------------------------------------

type HandlerRegistration<U, H> = ((helpers: H) => GuardedHandler<U>[]) | GuardedHandler<U>[]

// ---------------------------------------------------------------------------
// Bot config for run / webhook
// ---------------------------------------------------------------------------

export interface BotRunConfig {
  bot_token: string
  poll?: Partial<PollSettings>
  onUpdate?: (update: Update) => void
  onHandleResult?: (result: HandleResult) => void
  logger?: BotLogger
}

export interface BotWebhookConfig {
  bot_token: string
  onHandleResult?: (result: HandleResult) => void
  logger?: BotLogger
}

// ---------------------------------------------------------------------------
// Bot interface
// ---------------------------------------------------------------------------

export interface Bot {
  onMessage(input: HandlerRegistration<Message, MessageHelpers>): Bot
  onEditedMessage(input: HandlerRegistration<Message, GenericHelpers<Message>>): Bot
  onChannelPost(input: HandlerRegistration<Message, GenericHelpers<Message>>): Bot
  onEditedChannelPost(input: HandlerRegistration<Message, GenericHelpers<Message>>): Bot
  onBusinessMessage(input: HandlerRegistration<Message, GenericHelpers<Message>>): Bot
  onEditedBusinessMessage(input: HandlerRegistration<Message, GenericHelpers<Message>>): Bot
  onCallbackQuery(input: HandlerRegistration<CallbackQuery, CallbackQueryHelpers>): Bot
  onInlineQuery(input: HandlerRegistration<InlineQuery, InlineQueryHelpers>): Bot

  on<K extends AvailableUpdateTypes>(
    type: K,
    input: HandlerRegistration<NonNullable<Update[K]>, GenericHelpers<NonNullable<Update[K]>>>
  ): Bot

  run(config: BotRunConfig): Promise<BotInstance>
  webhook(config: BotWebhookConfig): WebhookHandler
}

// ---------------------------------------------------------------------------
// Helper factories
// ---------------------------------------------------------------------------

function makeMessageHelpers(): MessageHelpers {
  return {
    command: (cmd, handler) => ({
      match: ({ ctx }) => ctx.command === cmd,
      handle: handler
    }),
    text: (handler) => ({
      match: ({ update }) => !!update.text,
      handle: handler
    }),
    photo: (handler) => ({
      match: ({ update }) => !!update.photo,
      handle: handler
    }),
    document: (handler) => ({
      match: ({ update }) => !!update.document,
      handle: handler
    }),
    sticker: (handler) => ({
      match: ({ update }) => !!update.sticker,
      handle: handler
    }),
    fallback: (handler) => ({ handle: handler })
  }
}

function makeCallbackQueryHelpers(): CallbackQueryHelpers {
  return {
    data: (pattern, handler) => ({
      match: ({ update }) =>
        typeof pattern === "string" ? update.data === pattern : pattern.test(update.data ?? ""),
      handle: handler
    }),
    fallback: (handler) => ({ handle: handler })
  }
}

function makeInlineQueryHelpers(): InlineQueryHelpers {
  return {
    query: (pattern, handler) => ({
      match: ({ update }) =>
        typeof pattern === "string" ? update.query === pattern : pattern.test(update.query),
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
  return input
}

// ---------------------------------------------------------------------------
// createBot
// ---------------------------------------------------------------------------

export function createBot(): Bot {
  const handlers = new Map<string, GuardedHandler<any>[]>()

  function register(type: string, guards: GuardedHandler<any>[]): void {
    const existing = handlers.get(type) ?? []
    handlers.set(type, [...existing, ...guards])
  }

  function collectHandlers(): BotUpdatesHandlers {
    const result: Record<string, GuardedHandler<any>[]> = {}
    for (const [type, guards] of handlers) {
      result[`on_${type}`] = guards
    }
    return result as BotUpdatesHandlers
  }

  const bot: Bot = {
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

    on(type, input) {
      register(type, resolve(makeGenericHelpers, input))
      return bot
    },

    async run(config) {
      const collected = collectHandlers()
      if (handlers.size === 0) {
        console.warn("No handlers are defined for bot")
      }
      return runBot({
        ...config,
        mode: "single",
        ...collected
      })
    },

    webhook(config) {
      const collected = collectHandlers()
      return createWebhook({
        ...config,
        ...collected
      })
    }
  }

  return bot
}
