import type { LocationData } from "./specification/webapp"

export type BindOrUnbindEventHandler = <K extends keyof EventHandlers>(
  eventName: K,
  handler: EventHandlers[K]
) => void

export interface EventHandlers {
  activated: () => void
  deactivated: () => void
  themeChanged: () => void
  viewportChanged: (options: { isStateStable: boolean }) => void
  safeAreaChanged: () => void
  contentSafeAreaChanged: () => void
  mainButtonClicked: () => void
  secondaryButtonClicked: () => void
  backButtonClicked: () => void
  settingsButtonClicked: () => void
  invoiceClosed: (options: {
    url: string
    status: "paid" | "cancelled" | "failed" | "pending"
  }) => void
  popupClosed: (options: { button_id: string | null }) => void
  qrTextReceived: (options: { data: string }) => void
  scanQrPopupClosed: () => void
  clipboardTextReceived: (options: { data: string }) => void
  writeAccessRequested: (options: { status: "allowed" | "cancelled" }) => void
  contactRequested: (options: { status: "sent" | "cancelled" }) => void
  biometricManagerUpdated: () => void
  biometricAuthRequested: (options: {
    isAuthenticated: boolean
    biometricToken: string | null
  }) => void
  biometricTokenUpdated: (options: { isUpdated: boolean }) => void
  fullscreenChanged: () => void
  fullscreenFailed: (options: { error: "UNSUPPORTED" | "ALREADY_FULLSCREEN" }) => void
  homeScreenAdded: () => void
  homeScreenChecked: (options: { status: "unsupported" | "unknown" | "added" | "missed" }) => void
  accelerometerStarted: () => void
  accelerometerStopped: () => void
  accelerometerChanged: () => void
  accelerometerFailed: (options: { error: "UNSUPPORTED" }) => void
  deviceOrientationStarted: () => void
  deviceOrientationStopped: () => void
  deviceOrientationChanged: () => void
  deviceOrientationFailed: (options: { error: "UNSUPPORTED" }) => void
  gyroscopeStarted: () => void
  gyroscopeStopped: () => void
  gyroscopeChanged: () => void
  gyroscopeFailed: (options: { error: "UNSUPPORTED" }) => void
  locationManagerUpdated: () => void
  locationRequested: (options: { locationData: LocationData }) => void
  shareMessageSent: () => void
  shareMessageFailed: (options: {
    error:
      | "UNSUPPORTED"
      | "MESSAGE_EXPIRED"
      | "MESSAGE_SEND_FAILED"
      | "USER_DECLINED"
      | "UNKNOWN_ERROR"
  }) => void
  emojiStatusSet: () => void
  emojiStatusFailed: (options: {
    error:
      | "UNSUPPORTED"
      | "SUGGESTED_EMOJI_INVALID"
      | "DURATION_INVALID"
      | "USER_DECLINED"
      | "SERVER_ERROR"
      | "UNKNOWN_ERROR"
  }) => void
  emojiStatusAccessRequested: (options: { status: "allowed" | "cancelled" }) => void
  fileDownloadRequested: (options: { status: "downloading" | "cancelled" }) => void
}

/**
 * The error `WebApp.Serverless.call` passes to its callback: an `Error` with
 * the extra fields the docs list for it.
 */
export interface ServerlessCallError extends Error {
  /** `"ENDPOINT_ERROR"` when the endpoint threw an EndpointError; other values come from the platform. */
  type?: string
  /** HTTP status of the response, or `0` when the request could not be completed. */
  status: number
  /** Data the endpoint passed along with its EndpointError. */
  parameters?: unknown
}
