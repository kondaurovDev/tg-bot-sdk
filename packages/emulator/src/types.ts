/**
 * @module types
 * Public types of the emulator package.
 */
import type {
  CallbackQuery,
  Chat,
  ChosenInlineResult,
  InlineQuery,
  InlineQueryResult,
  Message,
  MessageEntity,
  RichMessage,
  Update,
  User
} from "@effect-ak/tg-bot-api"
import type { FileContent, TgBotClient } from "@effect-ak/tg-bot-client"

export interface EmulatorOptions {
  /** Id of the single virtual chat. Default: `1`. */
  chat_id?: number
  /** Overrides for the virtual human user. */
  user?: Partial<User>
  /** Overrides for the bot's own user. */
  bot?: Partial<User>
}

/**
 * A streamed message preview (`send_message_draft` /
 * `send_rich_message_draft`, Bot API 9.3+/10.1+). At most one draft is
 * visible at a time; sending any message finalizes (clears) it.
 */
export interface EmulatorDraft {
  draft_id: number
  /** `true` when the draft shows the "Thinking…" placeholder. */
  thinking: boolean
  text?: string
  entities?: MessageEntity[]
  rich_message?: RichMessage
  /** The user is offered a button to stop further drafts. */
  can_stop?: boolean
}

export type EmulatorEvent =
  | { type: "message"; message: Message }
  | { type: "message_edited"; message: Message }
  | { type: "message_deleted"; message_id: number }
  | {
      type: "callback_answered"
      callback_query_id: string
      text?: string
      show_alert?: boolean
    }
  | { type: "draft"; draft: EmulatorDraft }
  | { type: "draft_cleared" }
  | { type: "chat_action"; action: string }
  | { type: "reactions"; message_id: number; reactions: string[] }
  | { type: "inline_results"; inline_query_id: string; results: InlineQueryResult[] }

export interface TapButtonOptions {
  /** Message to look for the button in. Default: the latest message that has it. */
  message_id?: number
}

export interface WaitOptions {
  /** How long to wait before rejecting, in milliseconds. Default: `5000`. */
  timeout?: number
}

export interface UserMediaOptions {
  caption?: string
}

export interface TgBotEmulator {
  /** Drop-in client for `bot.run({ client })` / `makeTgBotClient` call sites. */
  readonly client: TgBotClient
  /** The virtual human user updates are sent from. */
  readonly user: User
  /** The bot's own user (returned by `get_me`). */
  readonly bot: User
  /** The single virtual chat. */
  readonly chat: Chat
  /** Snapshot of the chat history, oldest first. */
  readonly messages: readonly Message[]
  /** The currently streamed draft, if any. */
  readonly draft: EmulatorDraft | null
  /** Reactions on messages (bot- or user-set), keyed by message id. */
  readonly reactions: Readonly<Record<number, readonly string[]>>
  /** Results of the most recent `answer_inline_query`, if any. */
  readonly inlineResults: readonly InlineQueryResult[]
  /**
   * Send a text message as the user: it is appended to the chat and
   * delivered to the bot as a `message` update. Text starting with `/`
   * gets a `bot_command` entity, so command handlers match.
   */
  sendMessage(text: string): Message
  /**
   * Tap an inline keyboard button by its `callback_data`: delivers a
   * `callback_query` update. Throws if no message has such a button.
   */
  tapButton(callback_data: string, options?: TapButtonOptions): CallbackQuery
  /** Send a photo as the user; the bytes round-trip through `get_file`. */
  sendPhoto(file: FileContent, options?: UserMediaOptions): Message
  /** Send a document as the user; the bytes round-trip through `get_file`. */
  sendDocument(file: FileContent, options?: UserMediaOptions): Message
  /**
   * Edit one of the user's own messages: delivers an `edited_message`
   * update. Throws when the message is missing or not the user's.
   */
  editMessage(message_id: number, text: string): Message
  /**
   * Set (or clear, with `null`) the user's reaction on a message:
   * delivers a `message_reaction` update. Note: real Telegram sends
   * those only when `allowed_updates` opts in — the emulator always does.
   */
  react(message_id: number, emoji: string | null): void
  /** Type an inline query "@bot …": delivers an `inline_query` update. */
  sendInlineQuery(query: string): InlineQuery
  /**
   * Pick a result the bot returned via `answer_inline_query`: delivers a
   * `chosen_inline_result` update, and posts the result's
   * `input_message_content.message_text` (if any) to the chat.
   */
  chooseInlineResult(result_id: string): ChosenInlineResult
  /** Deliver an arbitrary update to the bot (escape hatch for uncovered types). */
  pushUpdate(update: Omit<Update, "update_id">): Update
  /** Listen to chat activity. Returns an unsubscribe function. */
  subscribe(listener: (event: EmulatorEvent) => void): () => void
  /** Wait for the next event matching the predicate. */
  nextEvent(match: (event: EmulatorEvent) => boolean, options?: WaitOptions): Promise<EmulatorEvent>
  /** Wait for the next message sent by the bot. */
  nextBotMessage(options?: WaitOptions): Promise<Message>
  /** Clear the chat history and undelivered updates. Counters keep growing. */
  reset(): void
}
