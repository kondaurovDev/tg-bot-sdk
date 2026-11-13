// GENERATED CODE

import type * as T from "../event-handlers"

export interface WebApp {
  initData: string
  initDataUnsafe: WebAppInitData
  version: string
  platform: string
  colorScheme: string
  themeParams: ThemeParams
  isActive: boolean
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  bottomBarColor: string
  isClosingConfirmationEnabled: boolean
  isVerticalSwipesEnabled: boolean
  isFullscreen: boolean
  isOrientationLocked: boolean
  safeAreaInset: SafeAreaInset
  contentSafeAreaInset: ContentSafeAreaInset
  BackButton: BackButton
  MainButton: BottomButton
  SecondaryButton: BottomButton
  SettingsButton: SettingsButton
  HapticFeedback: HapticFeedback
  CloudStorage: CloudStorage
  BiometricManager: BiometricManager
  Accelerometer: Accelerometer
  DeviceOrientation: DeviceOrientation
  Gyroscope: Gyroscope
  LocationManager: LocationManager
  DeviceStorage: DeviceStorage
  SecureStorage: SecureStorage
  Serverless: Serverless
  isVersionAtLeast: (version: string) => boolean
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  setBottomBarColor: (color: string) => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  enableVerticalSwipes: () => void
  disableVerticalSwipes: () => void
  requestFullscreen: () => void
  exitFullscreen: () => void
  lockOrientation: () => void
  unlockOrientation: () => void
  addToHomeScreen: () => void
  checkHomeScreenStatus: (
    callback?: (status: "unsupported" | "unknown" | "added" | "missed") => void
  ) => void
  onEvent: T.BindOrUnbindEventHandler
  offEvent: T.BindOrUnbindEventHandler
  sendData: (data: string) => void
  switchInlineQuery: (query: string, chat_type?: "users" | "bots" | "groups" | "channels") => void
  openLink: (url: string, options?: { try_instant_view: boolean }) => void
  openTelegramLink: (url: string) => void
  openInvoice: (url: string, callback?: (invoiceStatus: unknown) => void) => void
  shareToStory: (mediaUrl: string, options?: StoryShareParams) => void
  shareMessage: (msg_id: number, options?: (isSent: boolean) => void) => void
  setEmojiStatus: (
    custom_emoj_id: string,
    params?: EmojiStatusParams,
    callback?: (isStatusSet: boolean) => void
  ) => void
  requestEmojiStatusAccess: (url: string, callback?: (invoiceStatus: unknown) => void) => void
  downloadFile: (params: DownloadFileParams, callback?: (isAccepted: boolean) => void) => void
  hideKeyboard: () => void
  showPopup: (params: PopupParams, callback?: (buttonId: string) => void) => void
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback?: (isOk: boolean) => void) => void
  showScanQrPopup: (params: ScanQrPopupParams, callback?: (data: string) => boolean) => void
  closeScanQrPopup: () => void
  readTextFromClipboard: (callback?: (text: string) => void) => void
  requestWriteAccess: (callback?: (isGranted: boolean) => void) => void
  requestContact: (callback?: (isShared: boolean) => void) => void
  requestChat: unknown
  ready: () => void
  expand: () => void
  close: () => void
}

/** This object provides access to accelerometer data on the device. */
export interface Accelerometer {
  isStarted: boolean
  x: number
  y: number
  z: number
  start: (
    params: AccelerometerStartParams,
    callback?: (isStarted: boolean) => void
  ) => Accelerometer
  stop: (callback?: (isStopped: boolean) => void) => Accelerometer
}

/** This object defines the parameters for starting accelerometer tracking. */
export interface AccelerometerStartParams {
  refresh_rate?: number
}

/** This object controls the back button, which can be displayed in the header of the Mini App in the Telegram interface. */
export interface BackButton {
  isVisible: boolean
  onClick: T.EventHandlers["backButtonClicked"]
  offClick: T.EventHandlers["backButtonClicked"]
  show: () => BackButton
  hide: () => BackButton
}

/** This object describes the native popup for authenticating the user using biometrics. */
export interface BiometricAuthenticateParams {
  reason?: string
}

/**
 * This object controls biometrics on the device
 * Before the first use of this object, it needs to be initialized using the init method.
 */
export interface BiometricManager {
  isInited: boolean
  isBiometricAvailable: boolean
  biometricType: "finger" | "face" | "unknown"
  isAccessRequested: boolean
  isAccessGranted: boolean
  isBiometricTokenSaved: boolean
  deviceId: string
  init: (callback?: () => void) => BiometricManager
  requestAccess: (
    params: BiometricRequestAccessParams,
    callback?: (isGranted: boolean) => void
  ) => BiometricManager
  authenticate: (
    params: BiometricAuthenticateParams,
    callback?: (isAuthenticated: boolean) => void
  ) => BiometricManager
  updateBiometricToken: (
    token: string,
    callback?: (isTokenUpdated: boolean) => void
  ) => BiometricManager
  openSettings: () => BiometricManager
}

/** This object describes the native popup for requesting permission to use biometrics. */
export interface BiometricRequestAccessParams {
  reason?: string
}

/** This object controls the button that is displayed at the bottom of the Mini App in the Telegram interface. */
export interface BottomButton {
  type: string
  iconCustomEmojiId: string
  text: string
  color: string
  textColor: string
  isVisible: boolean
  isActive: boolean
  hasShineEffect: boolean
  position: string
  isProgressVisible: boolean
  setText: (text: string) => BottomButton
  onClick: (callback: () => void) => BottomButton
  offClick: (callback: () => void) => BottomButton
  show: () => BottomButton
  hide: () => BottomButton
  enable: () => BottomButton
  disable: () => BottomButton
  showProgress: (callback: (leaveActive: boolean) => void) => BottomButton
  hideProgress: () => BottomButton
  setParams: (params: {
    text: string
    color: string
    has_shine_effect: boolean
    position: unknown
    is_active: boolean
    is_visible: boolean
  }) => BottomButton
}

/**
 * This object controls the cloud storage
 * Each bot can store up to 1024 items per user in the cloud storage.
 */
export interface CloudStorage {
  setItem: (key: string, value: string, callback?: (error: unknown | null) => void) => CloudStorage
  getItem: (
    key: string,
    callback: (error: unknown | null, value: string | null) => void
  ) => CloudStorage
  getItems: (
    keys: string[],
    callback: (error: string | null, values: Record<string, string> | null) => void
  ) => CloudStorage
  removeItem: (
    key: string,
    callback?: (error: string | null, isDeleted: boolean) => void
  ) => CloudStorage
  removeItems: (
    keys: string[],
    callback?: (error: string | null, isDeleted: boolean) => void
  ) => CloudStorage
  getKeys: (callback: (error: string | null, keys: string[] | null) => void) => CloudStorage
}

/** This object represents the content-defined safe area insets, providing padding values to ensure content remains within visible boundaries, avoiding overlap with Telegram UI elements. */
export interface ContentSafeAreaInset {
  top: number
  bottom: number
  left: number
  right: number
}

/** This object provides access to orientation data on the device. */
export interface DeviceOrientation {
  isStarted: boolean
  absolute: boolean
  alpha: number
  beta: number
  gamma: number
  start: (params: DeviceOrientationStartParams, callback?: (isTracking: boolean) => void) => void
  stop: (callback?: (isStopped: boolean) => void) => void
}

/** This object defines the parameters for starting device orientation tracking. */
export interface DeviceOrientationStartParams {
  refresh_rate?: number
  need_absolute?: boolean
}

/**
 * This object provides access to persistent local storage on the user’s device
 * It is conceptually similar to the browser's localStorage API, but integrated within the Telegram client
 * All data is stored locally and is available only to the bot that created it
 * Each bot can store up to 5 MB per user using this storage.
 */
export interface DeviceStorage {
  setItem: (
    key: string,
    value: string,
    callback?: (error: unknown | null, isStored: boolean) => void
  ) => DeviceStorage
  getItem: (
    key: string,
    callback: (error: unknown | null, value: string | null) => void
  ) => DeviceStorage
  removeItem: (
    key: string,
    callback?: (error: unknown | null, isRemoved: boolean) => void
  ) => DeviceStorage
  clear: (callback?: (error: unknown | null, isCleared: boolean) => void) => DeviceStorage
}

/**
 * This object describes the parameters for the file download request.
 * Note: To ensure consistent file download behavior across platforms, include the HTTP headers Content-Disposition: attachment; filename="<file_name>" and Access-Control-Allow-Origin: https://web.telegram.org in the server response
 * Without these headers, the download may not work as expected, especially on web platforms.
 */
export interface DownloadFileParams {
  url: string
  file_name: string
}

/** This object describes additional settings for setting an emoji status. */
export interface EmojiStatusParams {
  duration?: number
}

/** This object provides access to gyroscope data on the device. */
export interface Gyroscope {
  isStarted: boolean
  x: number
  y: number
  z: number
  start: (params: GyroscopeStartParams, callback?: (isTracking: boolean) => void) => void
  stop: (callback?: (isStopped: boolean) => void) => void
}

/** This object defines the parameters for starting gyroscope tracking. */
export interface GyroscopeStartParams {
  refresh_rate?: number
}

/** This object controls haptic feedback. */
export interface HapticFeedback {
  impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void
  notificationOccurred: (type: "error" | "success" | "warning") => void
  selectionChanged: () => HapticFeedback
}

/** This object contains data about the current location. */
export interface LocationData {
  latitude: number
  longitude: number
  altitude: number
  course: number
  speed: number
  horizontal_accuracy: number
  vertical_accuracy: number
  course_accuracy: number
  speed_accuracy: number
}

/**
 * This object controls location access on the device
 * Before the first use of this object, it needs to be initialized using the init method.
 */
export interface LocationManager {
  isInited: boolean
  isLocationAvailable: boolean
  isAccessRequested: boolean
  isAccessGranted: boolean
  init: (callback?: () => void) => LocationManager
  getLocation: (callback: (location: LocationData | null) => void) => LocationManager
  openSettings: () => LocationManager
}

/** This object describes the native popup button. */
export interface PopupButton {
  id?: string
  type?: "OK" | "Close" | "Cancel"
  text?: string
}

/** This object describes the native popup. */
export interface PopupParams {
  message: string
  title?: string
  buttons?: PopupButton[]
}

/** This object represents the system-defined safe area insets, providing padding values to ensure content remains within visible boundaries, avoiding overlap with system UI elements like notches or navigation bars. */
export interface SafeAreaInset {
  top: number
  bottom: number
  left: number
  right: number
}

/** This object describes the native popup for scanning QR codes. */
export interface ScanQrPopupParams {
  text?: string
}

/**
 * This object provides access to a secure storage on the user’s device for sensitive data
 * On iOS, it uses the system Keychain; on Android, it uses the Keystore
 * This ensures that all stored values are encrypted at rest and inaccessible to unauthorized applications.
 * Secure storage is suitable for storing tokens, secrets, authentication state, and other sensitive user-specific information
 * Each bot can store up to 10 items per user.
 */
export interface SecureStorage {
  setItem: (
    key: string,
    value: string,
    callback?: (error: unknown | null, isStored: boolean) => void
  ) => SecureStorage
  getItem: (
    key: string,
    callback: (error: unknown | null, value: string | null, canBeRestored: boolean) => void
  ) => SecureStorage
  restoreItem: (
    key: string,
    callback?: (error: unknown | null, value: string | null) => void
  ) => SecureStorage
  removeItem: (
    key: string,
    callback?: (error: unknown | null, isRemoved: boolean) => void
  ) => SecureStorage
  clear: (callback?: (error: unknown | null, isCleared: boolean) => void) => SecureStorage
}

/**
 * This object lets a Mini App hosted on Telegram Serverless call the bot's endpoints – the server-side functions of the Mini App
 * Each call is sent together with the Mini App's initData, which the platform validates before running the endpoint, so the endpoint always knows which user is calling it.
 */
export interface Serverless {
  call: unknown
}

/** This object controls the Settings item in the context menu of the Mini App in the Telegram interface. */
export interface SettingsButton {
  isVisible: boolean
  onClick: (callback: () => void) => SettingsButton
  offClick: (callback: () => void) => SettingsButton
  show: () => SettingsButton
  hide: () => SettingsButton
}

/** This object describes additional sharing settings for the native story editor. */
export interface StoryShareParams {
  text?: string
  widget_link?: StoryWidgetLink
}

/** This object describes a widget link to be included in the story. */
export interface StoryWidgetLink {
  url: string
  name?: string
}

/**
 * Mini Apps can adjust the appearance of the interface to match the Telegram user's app in real time
 * This object contains the user's current theme settings:
 */
export interface ThemeParams {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
  header_bg_color?: string
  bottom_bar_bg_color?: string
  accent_text_color?: string
  section_bg_color?: string
  section_header_text_color?: string
  section_separator_color?: string
  subtitle_text_color?: string
  destructive_text_color?: string
}

/** This object represents a chat. */
export interface WebAppChat {
  id: number
  type: "group" | "supergroup" | "channel"
  title: string
  username?: string
  photo_url?: "in"
}

/**
 * This object contains data that is transferred to the Mini App when it is opened
 * It is empty if the Mini App was launched from a keyboard button or from inline mode.
 */
export interface WebAppInitData {
  auth_date: number
  hash: string
  signature: string
  query_id?: string
  chat_join_request_query_id?: string
  user?: WebAppUser
  receiver?: WebAppUser
  chat?: WebAppChat
  chat_type?: string
  chat_instance?: string
  start_param?: string
  can_send_after?: number
}

/** This object contains the data of the Mini App user. */
export interface WebAppUser {
  id: number
  first_name: string
  is_bot?: boolean
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  added_to_attachment_menu?: boolean
  allows_write_to_pm?: boolean
  photo_url?: "in"
}
