/**
 * @module state
 * Internal state of one emulator instance: the chat history, the update
 * queue with its long-poll waiters, the active draft, reactions, and
 * uploaded files. Method handlers mutate the world only through this.
 */
import type { Chat, InlineQueryResult, Message, Update, User } from "@effect-ak/tg-bot-api"

import { EmulatorApiError } from "./errors"
import type { EmulatorDraft, EmulatorEvent } from "./types"

export interface UploadedFile {
  content: Uint8Array
  file_name: string
}

export class EmulatorState {
  messages: Message[] = []
  pendingUpdates: Update[] = []
  activeDraft: EmulatorDraft | null = null
  readonly reactions = new Map<number, string[]>()
  readonly uploads = new Map<string, UploadedFile>()
  /** `answer_inline_query` results, keyed by inline query id. */
  readonly inlineAnswers = new Map<string, { query: string; results: InlineQueryResult[] }>()
  lastInlineQueryId: string | null = null

  nextMessageId = 1
  nextUpdateId = 1
  nextCallbackId = 1
  nextFileId = 1
  nextInlineQueryId = 1

  private readonly listeners = new Set<(event: EmulatorEvent) => void>()
  private pollWaiters: Array<() => void> = []

  constructor(
    readonly user: User,
    readonly bot: User,
    readonly chat: Chat
  ) {}

  nowSeconds(): number {
    return Math.floor(Date.now() / 1000)
  }

  emit(event: EmulatorEvent): void {
    for (const listener of this.listeners) listener(event)
  }

  subscribe(listener: (event: EmulatorEvent) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** Append to the chat history and notify listeners. */
  storeMessage(message: Message): Message {
    this.messages.push(message)
    this.emit({ type: "message", message })
    return message
  }

  /** Queue an update for the bot and wake pending `get_updates` calls. */
  pushUpdate(update: Omit<Update, "update_id">): Update {
    const full: Update = { update_id: this.nextUpdateId++, ...update }
    this.pendingUpdates.push(full)
    this.wakeUpPolls()
    return full
  }

  findMessage(action: string, message_id: unknown): Message {
    const message = this.messages.find((m) => m.message_id === message_id)
    if (!message) {
      throw new EmulatorApiError(400, `Bad Request: message to ${action} not found`)
    }
    return message
  }

  /** Sending any real message finalizes the streamed draft. */
  clearDraft(): void {
    if (!this.activeDraft) return
    this.activeDraft = null
    this.emit({ type: "draft_cleared" })
  }

  setDraft(draft: EmulatorDraft): void {
    this.activeDraft = draft
    this.emit({ type: "draft", draft })
  }

  registerUpload(file: UploadedFile): string {
    const file_id = `emu-file-${this.nextFileId++}`
    this.uploads.set(file_id, file)
    return file_id
  }

  /** Resolves (or times out) when a new update lands in the queue. */
  waitForUpdate(timeoutSeconds: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        this.pollWaiters = this.pollWaiters.filter((w) => w !== wake)
        resolve()
      }, timeoutSeconds * 1000)
      const wake = () => {
        clearTimeout(timer)
        resolve()
      }
      this.pollWaiters.push(wake)
    })
  }

  wakeUpPolls(): void {
    const waiters = this.pollWaiters
    this.pollWaiters = []
    for (const wake of waiters) wake()
  }

  reset(): void {
    this.messages = []
    this.pendingUpdates = []
    this.activeDraft = null
    this.reactions.clear()
    this.uploads.clear()
    this.inlineAnswers.clear()
    this.lastInlineQueryId = null
    this.wakeUpPolls()
  }
}
