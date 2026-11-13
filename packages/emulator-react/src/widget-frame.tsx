/**
 * @module widget-frame
 * HTML widgets (Bot API 10.4) in a sandboxed iframe: its own opaque
 * origin, no network (a Content-Security-Policy), and `window.TelegramWidget`
 * — a shim of the runtime Telegram apps provide — talking to the chat over
 * `postMessage`. `request()` reaches the bot through the port; a change of
 * the widget's state arrives as `chatDataChanged` / `publicDataChanged`.
 *
 * What the shim leaves out: the wallet (always `null`), previews and
 * forwards, haptics (no-ops), background requests and rate limits, and the
 * profile's sanitizing of HTML and CSS — the browser renders what it gets.
 */
import type { Widget } from "@effect-ak/tg-bot-api"
import { useContext, useEffect, useMemo, useRef, useState } from "react"

import { ChatServicesContext } from "./chat-services"

/** The light palette of an incoming bubble, under the keys of Mini Apps' themeParams. */
export const WIDGET_THEME: Readonly<Record<string, string>> = {
  bg_color: "#ffffff",
  text_color: "#000000",
  hint_color: "#8a9aa8",
  link_color: "#2481cc",
  button_color: "#2481cc",
  button_text_color: "#ffffff",
  secondary_bg_color: "#f1f3f5",
  accent_text_color: "#2481cc",
  subtitle_text_color: "#8a9aa8",
  destructive_text_color: "#e53935",
  section_bg_color: "#ffffff",
  section_header_text_color: "#2481cc",
  section_separator_color: "#e5e7eb",
  header_bg_color: "#ffffff",
  bottom_bar_bg_color: "#ffffff"
}

const MIN_HEIGHT = 50
const MAX_HEIGHT = 600
const clampHeight = (height: number) => Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, height))

export interface WidgetInit {
  chatData: string | null
  publicData: string | null
  viewer: { id: number; first_name: string }
}

// Runs in the widget before its own code. Plain ES2020, no imports.
const SHIM = String.raw`(() => {
  const init = __INIT__;
  const handlers = new Map();
  const pending = new Map();
  let nextId = 1;
  let busy = false;
  const post = (message) => parent.postMessage(Object.assign({ __tgWidget: true }, message), "*");
  const fire = (type) => (handlers.get(type) || []).forEach((handler) => {
    try { handler.call(W); } catch (error) { setTimeout(() => { throw error; }); }
  });
  class WidgetRequestError extends Error {
    constructor(code) { super(code); this.name = "WidgetRequestError"; this.code = code; }
  }
  const byteLength = (text) => new TextEncoder().encode(text).length;
  const W = {
    profile: 1,
    isProfileAtLeast: (n) => typeof n === "number" && n <= 1,
    colorScheme: "light",
    themeParams: Object.freeze(init.theme),
    isActive: true,
    isPreview: false,
    isForward: false,
    chatType: "private",
    viewer: Object.freeze(init.viewer),
    publicData: init.publicData,
    chatData: init.chatData,
    watchPublicData() {},
    unwatchPublicData() {},
    request(data) {
      if (typeof data !== "string" || byteLength(data) < 1 || byteLength(data) > 64) {
        throw new TypeError("TelegramWidget.request: data must be 1-64 bytes");
      }
      if (busy) return Promise.reject(new WidgetRequestError("BUSY"));
      busy = true;
      const id = nextId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        post({ type: "request", id, data });
      });
    },
    copyText(text) { post({ type: "copy", text: String(text) }); },
    openLink(url) { post({ type: "open", url: String(url) }); },
    openTelegramLink(url) { post({ type: "open", url: String(url) }); },
    HapticFeedback: {
      impactOccurred() { return this; },
      notificationOccurred() { return this; },
      selectionChanged() { return this; }
    },
    contentSafeAreaInset: Object.freeze({ top: 0, bottom: 0, left: 0, right: 0 }),
    wallet: null,
    setResizeAnchor() {},
    ready() { post({ type: "ready" }); },
    onEvent(type, handler) {
      if (!handlers.has(type)) handlers.set(type, []);
      handlers.get(type).push(handler);
    },
    offEvent(type, handler) {
      handlers.set(type, (handlers.get(type) || []).filter((h) => h !== handler));
    }
  };
  W.theme = W.colorScheme;
  W.onTheme = (callback) => W.onEvent("themeChanged", callback);
  Object.defineProperty(window, "TelegramWidget", { value: W });
  addEventListener("message", (event) => {
    const m = event.data;
    if (!m || m.__tgWidgetHost !== true) return;
    if (m.type === "answer") {
      const request = pending.get(m.id);
      pending.delete(m.id);
      busy = false;
      if (!request) return;
      if (m.ok) request.resolve({ result: m.result });
      else request.reject(new WidgetRequestError(m.code));
    } else if (m.type === "data") {
      const chatChanged = m.chatData !== W.chatData;
      const publicChanged = m.publicData !== W.publicData;
      W.chatData = m.chatData;
      W.publicData = m.publicData;
      if (chatChanged) fire("chatDataChanged");
      if (publicChanged) fire("publicDataChanged");
    }
  });
  const report = () => {
    const body = document.body;
    if (!body) return;
    const style = getComputedStyle(body);
    const height = body.getBoundingClientRect().height + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    post({ type: "size", height: Math.ceil(height) });
  };
  addEventListener("DOMContentLoaded", () => { new ResizeObserver(report).observe(document.body); report(); });
})();`

const themeVariables = Object.entries(WIDGET_THEME)
  .map(([key, value]) => `--tg-theme-${key.replaceAll("_", "-")}:${value}`)
  .join(";")

// Approximates the default stylesheet Telegram apps put under a widget's own
const DEFAULT_STYLES = `:root{${themeVariables};--tg-color-scheme:light;color-scheme:light}
html,body{background:transparent}
body{display:flow-root;margin:8px 12px;font:15px/1.35 system-ui,sans-serif;color:var(--tg-theme-text-color)}
a{color:var(--tg-theme-link-color)}
button{font:inherit;padding:6px 14px;border:0;border-radius:8px;background:var(--tg-theme-button-color);color:var(--tg-theme-button-text-color);cursor:pointer}
button:disabled{opacity:.6;cursor:default}`

// No network: the widget is offline, as in Telegram
const CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:"

/** The iframe's document: the policy, the default styles, the shim, then the widget. */
export const widgetDocument = (html: string, init: WidgetInit): string => {
  // JSON in a script: "<" escaped, so no "</script>" can end it early
  const initJson = JSON.stringify({ ...init, theme: WIDGET_THEME }).replaceAll("<", "\\u003c")
  return [
    '<!doctype html><html><head><meta charset="utf-8">',
    `<meta http-equiv="Content-Security-Policy" content="${CSP}">`,
    `<style>${DEFAULT_STYLES}</style>`,
    `<script>${SHIM.replace("__INIT__", initJson)}</script>`,
    `</head><body>${html}</body></html>`
  ].join("")
}

type FrameMessage =
  | { type: "size"; height: number }
  | { type: "ready" }
  | { type: "request"; id: number; data: string }
  | { type: "copy"; text: string }
  | { type: "open"; url: string }

/** A message from the shim, checked: the iframe runs the bot's code. */
export const readFrameMessage = (data: unknown): FrameMessage | undefined => {
  if (typeof data !== "object" || data === null) return undefined
  if (Reflect.get(data, "__tgWidget") !== true) return undefined
  const type: unknown = Reflect.get(data, "type")
  const height: unknown = Reflect.get(data, "height")
  const id: unknown = Reflect.get(data, "id")
  const text: unknown =
    Reflect.get(data, "data") ?? Reflect.get(data, "text") ?? Reflect.get(data, "url")
  if (type === "size" && typeof height === "number") return { type, height }
  if (type === "ready") return { type }
  if (type === "request" && typeof id === "number" && typeof text === "string") {
    return { type, id, data: text }
  }
  if (type === "copy" && typeof text === "string") return { type, text }
  if (type === "open" && typeof text === "string") return { type, url: text }
  return undefined
}

export interface WidgetFrameProps {
  message_id: number
  widget: Widget
  viewer?: { id: number; first_name: string }
}

export const WidgetFrame = ({
  message_id,
  widget,
  viewer = { id: 1, first_name: "You" }
}: WidgetFrameProps) => {
  const services = useContext(ChatServicesContext)
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(() => clampHeight(widget.height || 120))
  const [ready, setReady] = useState(false)

  // The document is built once per code: state changes go in by message
  const initial = useRef(widget)
  const srcDoc = useMemo(
    () =>
      widgetDocument(widget.html, {
        chatData: initial.current.chat_data ?? null,
        publicData: initial.current.public_data ?? null,
        viewer
      }),
    // Only the code: the viewer and the first state are read once
    [widget.html]
  )

  const toFrame = (message: Record<string, unknown>) =>
    frame.current?.contentWindow?.postMessage({ __tgWidgetHost: true, ...message }, "*")

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return
      const message = readFrameMessage(event.data)
      if (!message) return
      switch (message.type) {
        case "size":
          // A fixed height from sendWidget wins over the content's
          if (!widget.height) setHeight(clampHeight(message.height))
          setReady(true)
          break
        case "ready":
          setReady(true)
          break
        case "request": {
          const answer = (outcome: Record<string, unknown>) =>
            toFrame({ type: "answer", id: message.id, ...outcome })
          if (!services) {
            answer({ ok: false, code: "NOT_ALLOWED" })
            break
          }
          services.widgetRequest(message_id, message.data).then(
            (outcome) =>
              answer(
                outcome.ok
                  ? { ok: true, result: outcome.result }
                  : { ok: false, code: outcome.code }
              ),
            () => answer({ ok: false, code: "FAILED" })
          )
          break
        }
        case "copy":
          services?.copy(message.text)
          break
        case "open":
          if (message.url.startsWith("https://")) window.open(message.url, "_blank", "noopener")
          break
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [services, message_id, widget.height])

  // The bot changed the state: tell the running widget
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    toFrame({
      type: "data",
      chatData: widget.chat_data ?? null,
      publicData: widget.public_data ?? null
    })
  }, [widget.chat_data, widget.public_data])

  return (
    <div
      className="tgc-widget"
      data-testid="widget"
      data-ready={String(ready)}
      data-chat-data={widget.chat_data ?? ""}
      style={widget.width ? { width: Math.max(200, widget.width) } : undefined}
    >
      <iframe
        ref={frame}
        className="tgc-widget-frame"
        title="Widget"
        sandbox="allow-scripts"
        srcDoc={srcDoc}
        style={{ height }}
      />
    </div>
  )
}
