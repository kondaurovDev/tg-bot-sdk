/**
 * @module overrides
 *
 * Manual type overrides for cases the HTML parser can't infer automatically.
 *
 * Every override is a structured {@link SpecType} tree, so the spec JSON is
 * language-agnostic and TS is just one rendering target.
 *
 * - {@link returnTypeOverrides} — method return-type overrides
 * - {@link typeAliasOverrides} — entity-level type alias overrides
 * - {@link fieldOverrides} — per-field type overrides (keyed by entity → field)
 * - {@link globalFieldOverrides} — pattern-matched overrides applied across
 *   all entities (e.g. every `*parse_mode` field)
 */
import {
  array,
  enumOf,
  object,
  P,
  raw,
  ref,
  union,
  type SpecType
} from "~/scrape/type"
import type { ExtractedEntityField } from "~/scrape/type-system"
import { INITIALING_MINI_APPS } from "./constants"

// ── Helpers ──

/** Reusable: `AllowedUpdateName[]` (used by setWebhook and getUpdates). */
const allowedUpdatesArray = array(ref("AllowedUpdateName"))

// ── Return-type overrides ──

/** Method return types that can't be inferred from the description sentence. */
export const returnTypeOverrides: Record<string, SpecType> = {
  // Description reads "an array of Messages that were sent is returned",
  // which doesn't match `Returns X` / `Array of X` patterns.
  sendMediaGroup: array(ref("Message"))
}

// ── Type-alias overrides ──

/**
 * Top-level entities that have a description in docs but no field table.
 * Without an override, scraper assigns `never`.
 */
export const typeAliasOverrides: Record<string, SpecType> = {
  // Documented only as prose ("See section on uploading files..."); represent
  // the upload payload we actually accept from SDK users.
  InputFile: object([
    { name: "file_content", type: P.bytes, required: true },
    { name: "file_name", type: P.string, required: true }
  ])
}

// ── Global field overrides ──

export interface GlobalFieldOverride {
  /** Predicate against the extracted field. */
  match: (field: ExtractedEntityField) => boolean
  override: SpecType
}

/**
 * Pattern-based overrides checked before per-entity `fieldOverrides`.
 * Use sparingly — only for rules that apply across many entities.
 */
export const globalFieldOverrides: GlobalFieldOverride[] = [
  {
    // Any `*parse_mode` field is free-form String in docs, but the accepted
    // values are fixed. Covers `parse_mode`, `explanation_parse_mode`, etc.
    match: (f) => f.fieldName.endsWith("parse_mode"),
    override: enumOf("HTML", "MarkdownV2")
  }
]

// ── Per-field overrides: Bot API ──

const botApiFieldOverrides: Record<string, Record<string, SpecType>> = {
  // Docs type is plain `Array of String` — narrow to the AllowedUpdateName union.
  setWebhook: {
    allowed_updates: allowedUpdatesArray
  },
  getUpdates: {
    allowed_updates: allowedUpdatesArray
  },

  // Docs describe values in prose ("typing for text messages, upload_photo
  // for photos…"), not in a `must be one of` sentence, so the auto-enum
  // extractor misses them. List them explicitly.
  sendChatAction: {
    action: enumOf(
      "typing",
      "upload_photo",
      "record_video",
      "upload_video",
      "record_voice",
      "upload_voice",
      "upload_document",
      "choose_sticker",
      "find_location",
      "record_video_note",
      "upload_video_note"
    )
  },

  // Docs type is "Array of InputMediaAudio, InputMediaDocument,
  // InputMediaPhoto and InputMediaVideo" — a union inside an array, which
  // doesn't match the generic `Array of X` pattern.
  sendMediaGroup: {
    media: array(
      union(
        ref("InputMediaAudio"),
        ref("InputMediaDocument"),
        ref("InputMediaPhoto"),
        ref("InputMediaVideo")
      )
    )
  }
}

// ── Per-field overrides: Mini Apps ──
// Docs list the type as just "Function". Signatures below are raw TS —
// they're inherently JS-only (callbacks and inline shapes) so non-TS
// consumers of the JSON spec should treat `kind: "raw"` as opaque.

const miniAppFieldOverrides: Record<string, Record<string, SpecType>> = {
  [INITIALING_MINI_APPS]: {
    offEvent: raw(`T.BindOrUnbindEventHandler`),
    onEvent: raw(`T.BindOrUnbindEventHandler`),
    checkHomeScreenStatus: raw(
      `(callback?: (status: "unsupported" | "unknown" | "added" | "missed") => void) => void`
    ),
    downloadFile: raw(
      `(params: DownloadFileParams, callback?: (isAccepted: boolean) => void) => void`
    ),
    sendData: raw(`(data: string) => void`),
    switchInlineQuery: raw(
      `(query: string, chat_type?: "users" | "bots" | "groups" | "channels") => void`
    ),
    openLink: raw(
      `(url: string, options?: { try_instant_view: boolean }) => void`
    ),
    openTelegramLink: raw(`(url: string) => void`),
    isVersionAtLeast: raw(`(version: string) => boolean`),
    openInvoice: raw(
      `(url: string, callback?: (invoiceStatus: unknown) => void) => void`
    ),
    requestEmojiStatusAccess: raw(
      `(url: string, callback?: (invoiceStatus: unknown) => void) => void`
    ),
    shareToStory: raw(
      `(mediaUrl: string, options?: StoryShareParams) => void`
    ),
    setEmojiStatus: raw(
      `(custom_emoj_id: string, params?: EmojiStatusParams, callback?: (isStatusSet: boolean) => void) => void`
    ),
    setHeaderColor: raw(`(color: string) => void`),
    setBackgroundColor: raw(`(color: string) => void`),
    setBottomBarColor: raw(`(color: string) => void`),
    shareMessage: raw(
      `(msg_id: number, options?: (isSent: boolean) => void) => void`
    ),
    showScanQrPopup: raw(
      `(params: ScanQrPopupParams, callback?: (data: string) => boolean) => void`
    ),
    showPopup: raw(
      `(params: PopupParams, callback?: (buttonId: string) => void) => void`
    ),
    showAlert: raw(`(message: string, callback?: () => void) => void`),
    showConfirm: raw(
      `(message: string, callback?: (isOk: boolean) => void) => void`
    ),
    readTextFromClipboard: raw(`(callback?: (text: string) => void) => void`),
    requestWriteAccess: raw(
      `(callback?: (isGranted: boolean) => void) => void`
    ),
    requestContact: raw(`(callback?: (isShared: boolean) => void) => void`)
  },
  Accelerometer: {
    start: raw(
      "(params: AccelerometerStartParams, callback?: (isStarted: boolean) => void) => Accelerometer"
    ),
    stop: raw("(callback?: (isStopped: boolean) => void) => Accelerometer")
  },
  BottomButton: {
    onClick: raw("(callback: () => void) => BottomButton"),
    offClick: raw("(callback: () => void) => BottomButton"),
    showProgress: raw(
      "(callback: (leaveActive: boolean) => void) => BottomButton"
    ),
    setParams: raw(
      `
      (params: {
        text: string,
        color: string,
        has_shine_effect: boolean,
        position: unknown,
        is_active: boolean,
        is_visible: boolean
      }) => BottomButton
    `.trim()
    ),
    setText: raw("(text: string) => BottomButton")
  },
  BiometricManager: {
    biometricType: enumOf("finger", "face", "unknown"),
    init: raw("(callback?: () => void) => BiometricManager"),
    requestAccess: raw(
      "(params: BiometricRequestAccessParams, callback?: (isGranted: boolean) => void) => BiometricManager"
    ),
    authenticate: raw(
      "(params: BiometricAuthenticateParams, callback?: (isAuthenticated: boolean) => void) => BiometricManager"
    ),
    updateBiometricToken: raw(
      "(token: string, callback?: (isTokenUpdated: boolean) => void) => BiometricManager"
    )
  },
  CloudStorage: {
    setItem: raw(
      "(key: string, value: string, callback?: (error: unknown | null) => void) => CloudStorage"
    ),
    getItem: raw(
      "(key: string, callback: (error: unknown | null, value: string | null) => void) => CloudStorage"
    ),
    getItems: raw(
      "(keys: string[], callback: (error: string | null, values: Record<string, string> | null) => void) => CloudStorage"
    ),
    removeItem: raw(
      "(key: string, callback?: (error: string | null, isDeleted: boolean) => void) => CloudStorage"
    ),
    removeItems: raw(
      "(keys: string[], callback?: (error: string | null, isDeleted: boolean) => void) => CloudStorage"
    ),
    getKeys: raw(
      "(callback: (error: string | null, keys: string[] | null) => void) => CloudStorage"
    )
  },
  DeviceOrientation: {
    start: raw(
      "(params: DeviceOrientationStartParams, callback?: (isTracking: boolean) => void) => void"
    ),
    stop: raw("(callback?: (isStopped: boolean) => void) => void")
  },
  Gyroscope: {
    start: raw(
      "(params: GyroscopeStartParams, callback?: (isTracking: boolean) => void) => void"
    ),
    stop: raw("(callback?: (isStopped: boolean) => void) => void")
  },
  HapticFeedback: {
    impactOccurred: raw(
      `(style: "light" | "medium" | "heavy" | "rigid" | "soft") => void`
    ),
    notificationOccurred: raw(
      `(type: "error" | "success" | "warning") => void`
    )
  },
  LocationManager: {
    init: raw("(callback?: () => void) => LocationManager"),
    getLocation: raw(
      "(callback: (location: LocationData | null) => void) => LocationManager"
    )
  },
  SettingsButton: {
    onClick: raw("(callback: () => void) => SettingsButton"),
    offClick: raw("(callback: () => void) => SettingsButton")
  },
  BackButton: {
    onClick: raw(`T.EventHandlers["backButtonClicked"]`),
    offClick: raw(`T.EventHandlers["backButtonClicked"]`)
  },
  DeviceStorage: {
    setItem: raw(
      `(key: string, value: string, callback?: (error: unknown | null, isStored: boolean) => void) => DeviceStorage`
    ),
    getItem: raw(
      `(key: string, callback: (error: unknown | null, value: string | null) => void) => DeviceStorage`
    ),
    removeItem: raw(
      `(key: string, callback?: (error: unknown | null, isRemoved: boolean) => void) => DeviceStorage`
    ),
    clear: raw(
      `(callback?: (error: unknown | null, isCleared: boolean) => void) => DeviceStorage`
    )
  },
  SecureStorage: {
    setItem: raw(
      `(key: string, value: string, callback?: (error: unknown | null, isStored: boolean) => void) => SecureStorage`
    ),
    getItem: raw(
      `(key: string, callback: (error: unknown | null, value: string | null, canBeRestored: boolean) => void) => SecureStorage`
    ),
    restoreItem: raw(
      `(key: string, callback?: (error: unknown | null, value: string | null) => void) => SecureStorage`
    ),
    removeItem: raw(
      `(key: string, callback?: (error: unknown | null, isRemoved: boolean) => void) => SecureStorage`
    ),
    clear: raw(
      `(callback?: (error: unknown | null, isCleared: boolean) => void) => SecureStorage`
    )
  }
}

// ── Combined per-field overrides ──

export const fieldOverrides: Record<string, Record<string, SpecType>> = {
  ...botApiFieldOverrides,
  ...miniAppFieldOverrides
}
