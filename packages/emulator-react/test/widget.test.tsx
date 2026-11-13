import { BotResponse, createBot } from "@effect-ak/tg-bot"
import { makeTgBotEmulator } from "@effect-ak/tg-bot-emulator"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Chat } from "~/chat"
import { createEmulatorPort } from "~/port"
import { readFrameMessage, widgetDocument } from "~/widget-frame"

const silentLogger = { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} }
const running: { stop(): void }[] = []
afterEach(() => {
  cleanup()
  for (const bot of running.splice(0)) bot.stop()
})

describe("widgetDocument", () => {
  it("puts the shim before the widget and keeps the state from closing the script", () => {
    const doc = widgetDocument("<p id=w>widget</p>", {
      colorScheme: "dark",
      chatData: "</script><b>",
      publicData: null,
      viewer: { id: 1, first_name: "You" }
    })
    expect(doc.indexOf("TelegramWidget")).toBeLessThan(doc.indexOf("<p id=w>"))
    expect(doc).not.toContain("</script><b>")
    expect(doc).toContain("\\u003c/script>")
    expect(doc).toContain("default-src 'none'")
    expect(doc).toContain("--tg-theme-bg-color:#182533")
  })
})

describe("readFrameMessage", () => {
  it("takes only the shim's messages, checked", () => {
    expect(readFrameMessage({ __tgWidget: true, type: "request", id: 1, data: "n" })).toEqual({
      type: "request",
      id: 1,
      data: "n"
    })
    expect(readFrameMessage({ type: "request", id: 1, data: "n" })).toBeUndefined()
    expect(
      readFrameMessage({ __tgWidget: true, type: "request", id: "1", data: "n" })
    ).toBeUndefined()
    expect(readFrameMessage("size")).toBeUndefined()
  })
})

describe("<WidgetFrame> in the chat", () => {
  it("carries a request to the bot, the answer back, and the new state in", async () => {
    const emulator = makeTgBotEmulator()
    running.push(
      await createBot()
        .onMessage(({ fallback }) => [
          fallback(() =>
            BotResponse.make({
              type: "widget",
              html: "<p>widget</p>",
              chat_data: "0",
              allow_queries: true
            })
          )
        ])
        .onWidgetQuery(({ fallback }) => [
          fallback(({ payload, ctx }) => [
            ctx.answerWidgetQuery(`pong:${payload.data}`),
            ctx.editWidgetData({ chat_data: "1" })
          ])
        ])
        .run({ client: emulator.client, logger: silentLogger })
    )
    const port = createEmulatorPort(emulator)
    const { rerender } = render(<Chat port={port} />)
    fireEvent.click(screen.getByTestId("chat-start"))
    await waitFor(() => expect(screen.queryByTestId("widget")).not.toBeNull(), { timeout: 5000 })

    const iframe = screen.getByTitle("Widget")
    expect(iframe.getAttribute("sandbox")).toBe("allow-scripts")
    const frameWindow = (iframe as HTMLIFrameElement).contentWindow
    if (!frameWindow) throw new Error("no frame window")
    const toFrame = vi.spyOn(frameWindow, "postMessage")

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { __tgWidget: true, type: "request", id: 7, data: "ping" },
        source: frameWindow
      })
    )

    await waitFor(
      () =>
        expect(toFrame).toHaveBeenCalledWith(
          { __tgWidgetHost: true, type: "answer", id: 7, ok: true, result: "pong:ping" },
          "*"
        ),
      { timeout: 5000 }
    )
    await waitFor(() => expect(screen.getByTestId("widget").dataset["chatData"]).toBe("1"), {
      timeout: 5000
    })
    expect(toFrame).toHaveBeenCalledWith(
      { __tgWidgetHost: true, type: "data", chatData: "1", publicData: null },
      "*"
    )

    // Night mode reaches the running widget
    rerender(<Chat port={port} theme="dark" />)
    expect(toFrame).toHaveBeenCalledWith(
      expect.objectContaining({ type: "theme", colorScheme: "dark" }),
      "*"
    )
    expect(screen.getByTestId("chat").dataset["theme"]).toBe("dark")
  })
})
