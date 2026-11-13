import { createBot } from "@effect-ak/tg-bot"
import { makeTgBotEmulator } from "@effect-ak/tg-bot-emulator"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Chat } from "~/chat"
import { createEmulatorPort, type ChatPortEvent } from "~/port"

const silentLogger = { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} }

const botMessages = () =>
  [...document.querySelectorAll('[data-testid="message"][data-from="bot"]')].map(
    (el) => el.textContent ?? ""
  )

// The bot answers through its long-poll loop: give it more than the default second
const until = (what: () => boolean) => waitFor(() => expect(what()).toBe(true), { timeout: 5000 })

const running: { stop(): void }[] = []
afterEach(() => {
  cleanup()
  for (const bot of running.splice(0)) bot.stop()
})

const start = async (bot: ReturnType<typeof createBot>) => {
  const emulator = makeTgBotEmulator()
  running.push(await bot.run({ client: emulator.client, logger: silentLogger }))
  return { emulator, port: createEmulatorPort(emulator) }
}

describe("<Chat>", () => {
  it("sends /start from the empty chat and shows the reply", async () => {
    const { port } = await start(createBot().command("/start", ({ ctx }) => ctx.reply("Hello!")))
    render(<Chat port={port} title="Demo" />)

    fireEvent.click(screen.getByTestId("chat-start"))

    await until(() => botMessages().some((text) => text.includes("Hello!")))
    expect(screen.getByTestId("chat").dataset["busy"]).toBe("false")
  })

  it("types into the composer and sends with Enter", async () => {
    const { port } = await start(
      createBot().onText(({ payload, ctx }) => ctx.reply(`echo ${payload.text}`))
    )
    render(<Chat port={port} />)

    const input = screen.getByTestId("chat-input")
    fireEvent.change(input, { target: { value: "ping" } })
    fireEvent.keyDown(input, { key: "Enter" })

    await until(() => botMessages().some((text) => text.includes("echo ping")))
    expect(input).toHaveProperty("value", "")
  })

  it("taps a rich message's button and an inline keyboard button", async () => {
    const { port } = await start(
      createBot()
        .command("/report", ({ payload, ctx }) =>
          ctx.call("send_rich_message", {
            chat_id: payload.chat.id,
            rich_message: {
              blocks: [
                { type: "heading", size: 1, text: "Weekly report" },
                { type: "buttons", buttons: [{ text: "Approve", callback_data: "approve" }] }
              ]
            }
          })
        )
        .command("/menu", ({ ctx }) =>
          ctx.reply("Pick", {
            reply_markup: { inline_keyboard: [[{ text: "Red", callback_data: "red" }]] }
          })
        )
        .onCallback("approve", ({ ctx }) => ctx.reply("Approved"))
        .onCallback("red", ({ ctx }) => ctx.editMessageText("You picked red"))
    )
    render(<Chat port={port} />)
    const send = (text: string) => {
      fireEvent.change(screen.getByTestId("chat-input"), { target: { value: text } })
      fireEvent.click(screen.getByTestId("chat-send"))
    }

    send("/report")
    await until(() => document.querySelector('button[data-callback="approve"]') !== null)
    fireEvent.click(document.querySelector('button[data-callback="approve"]') ?? document.body)
    await until(() => botMessages().some((text) => text.includes("Approved")))

    send("/menu")
    await until(() => screen.queryByTestId("keyboard-button") !== null)
    fireEvent.click(screen.getByTestId("keyboard-button"))
    await until(() => botMessages().some((text) => text.includes("You picked red")))
    expect(botMessages().some((text) => text.includes("edited"))).toBe(true)
  })

  it("reacts from the message menu and with a double click", async () => {
    const { port } = await start(createBot().command("/start", ({ ctx }) => ctx.reply("Hi")))
    render(<Chat port={port} />)
    fireEvent.click(screen.getByTestId("chat-start"))
    await until(() => botMessages().length === 1)
    const bubble = () =>
      document.querySelector('[data-testid="message"][data-from="bot"]') ?? document.body

    fireEvent.contextMenu(bubble(), { clientX: 10, clientY: 10 })
    fireEvent.click(screen.getByRole("button", { name: "🔥" }))
    await until(() => screen.queryByText("🔥") !== null)
    expect(screen.queryByTestId("message-menu")).toBeNull()

    fireEvent.click(bubble())
    fireEvent.click(bubble())
    await until(() => screen.queryByText("👍") !== null)
  })

  it("closes the menu on a press outside and deletes from it", async () => {
    const { port } = await start(createBot().command("/start", ({ ctx }) => ctx.reply("Hi")))
    render(<Chat port={port} />)
    fireEvent.click(screen.getByTestId("chat-start"))
    await until(() => botMessages().length === 1)
    const bubble =
      document.querySelector('[data-testid="message"][data-from="bot"]') ?? document.body

    fireEvent.contextMenu(bubble)
    fireEvent.pointerDown(screen.getByTestId("chat-messages"))
    expect(screen.queryByTestId("message-menu")).toBeNull()

    fireEvent.contextMenu(bubble)
    fireEvent.click(screen.getByRole("button", { name: /Delete/ }))
    await until(() => botMessages().length === 0)
  })

  it("passes a callback query's answer text to onNotice", async () => {
    const { port } = await start(
      createBot()
        .command("/start", ({ ctx }) =>
          ctx.reply("Go", {
            reply_markup: { inline_keyboard: [[{ text: "Go", callback_data: "go" }]] }
          })
        )
        .onCallback("go", ({ ctx }) => ctx.answerCallbackQuery({ text: "Done!" }))
    )
    const onNotice = vi.fn()
    render(<Chat port={port} onNotice={onNotice} />)
    fireEvent.click(screen.getByTestId("chat-start"))
    await until(() => screen.queryByTestId("keyboard-button") !== null)
    fireEvent.click(screen.getByTestId("keyboard-button"))
    await waitFor(() => expect(onNotice).toHaveBeenCalledWith("Done!", "success"), {
      timeout: 5000
    })
  })
})

describe("<Chat> around the composer", () => {
  it("lists the bot's commands in the Menu and sends the picked one", async () => {
    const { port } = await start(
      createBot()
        .command("/start", ({ ctx }) => [
          ctx.call("set_my_commands", {
            commands: [{ command: "help", description: "What I can do" }]
          }),
          ctx.reply("Hi")
        ])
        .command("/help", ({ ctx }) => ctx.reply("Help text"))
    )
    render(<Chat port={port} />)
    expect(screen.queryByTestId("chat-menu")).toBeNull()

    fireEvent.click(screen.getByTestId("chat-start"))
    await until(() => screen.queryByTestId("chat-menu") !== null)
    fireEvent.click(screen.getByTestId("chat-menu"))
    expect(screen.getByTestId("command-item").textContent).toContain("What I can do")
    fireEvent.click(screen.getByTestId("command-item"))

    await until(() => botMessages().some((text) => text.includes("Help text")))
    expect(screen.queryByTestId("commands-menu")).toBeNull()
  })

  it("shows the reply keyboard until the bot removes it", async () => {
    const { port } = await start(
      createBot()
        .command("/start", ({ ctx }) =>
          ctx.reply("Pick", {
            reply_markup: {
              keyboard: [[{ text: "Apple" }, { text: "Done" }]],
              input_field_placeholder: "Pick a fruit"
            }
          })
        )
        .onText(({ payload, ctx }) =>
          payload.text === "Done"
            ? ctx.reply("Bye", { reply_markup: { remove_keyboard: true } })
            : ctx.reply(`You picked ${payload.text}`)
        )
    )
    render(<Chat port={port} />)
    fireEvent.click(screen.getByTestId("chat-start"))
    await until(() => screen.queryAllByTestId("reply-keyboard-button").length === 2)
    expect(screen.getByTestId("chat-input").getAttribute("placeholder")).toBe("Pick a fruit")

    fireEvent.click(screen.getByRole("button", { name: "Apple" }))
    await until(() => botMessages().some((text) => text.includes("You picked Apple")))

    fireEvent.click(screen.getByTestId("keyboard-toggle"))
    expect(screen.queryByTestId("reply-keyboard")).toBeNull()
    fireEvent.click(screen.getByTestId("keyboard-toggle"))

    fireEvent.click(screen.getByRole("button", { name: "Done" }))
    await until(() => screen.queryByTestId("reply-keyboard") === null)
    expect(screen.queryByTestId("keyboard-toggle")).toBeNull()
  })

  it("shows a photo and a document the bot sent", async () => {
    vi.stubGlobal(
      "URL",
      Object.assign(URL, { createObjectURL: () => "blob:photo", revokeObjectURL: () => {} })
    )
    const { port } = await start(
      createBot().command("/start", ({ ctx }) => [
        ctx.replyWithPhoto({ file_content: new Uint8Array([1, 2, 3]), file_name: "cat.png" }),
        ctx.replyWithDocument({
          file_content: Uint8Array.from([110, 111, 116, 101, 115]),
          file_name: "notes.txt"
        })
      ])
    )
    render(<Chat port={port} />)
    fireEvent.click(screen.getByTestId("chat-start"))

    await until(() => screen.queryByTestId("photo")?.getAttribute("src") === "blob:photo")
    await until(() => screen.queryByTestId("document")?.textContent?.includes("notes.txt") === true)
    vi.unstubAllGlobals()
  })
})

describe("createEmulatorPort", () => {
  it("reports a failed action as an event instead of throwing", () => {
    const port = createEmulatorPort(makeTgBotEmulator())
    const events: ChatPortEvent[] = []
    port.subscribe((event) => events.push(event))

    port.tapButton("missing", 1)

    expect(events).toEqual([{ type: "action_error", error: expect.stringMatching(/not found/) }])
  })

  it("forwards emulator events only while someone listens", () => {
    const emulator = makeTgBotEmulator()
    const port = createEmulatorPort(emulator)
    const events: ChatPortEvent[] = []
    const unsubscribe = port.subscribe((event) => events.push(event))

    port.sendMessage("one")
    unsubscribe()
    port.sendMessage("two")

    expect(events.map((e) => (e.type === "message" ? e.message.text : e.type))).toEqual(["one"])
  })
})

describe("chatReducer", () => {
  it("ends the typing indicator when the bot's message arrives", async () => {
    const { chatReducer, initialChatState } = await import("~/use-chat")
    const typing = chatReducer(initialChatState, { type: "chat_action", action: "typing" })
    const message = {
      message_id: 1,
      date: 0,
      chat: { id: 1, type: "private" as const },
      from: { id: 2, is_bot: true, first_name: "Bot" },
      text: "hi"
    }
    expect(chatReducer(typing, { type: "message", message })).toMatchObject({
      typing: false,
      waiting: false
    })
  })
})

describe("<Chat> inline mode", () => {
  it("asks the bot for @username queries and sends the picked result via it", async () => {
    const { port } = await start(
      createBot().onInlineQuery(({ fallback }) => [
        fallback(({ payload, ctx }) =>
          ctx.call("answer_inline_query", {
            inline_query_id: payload.id,
            results: [
              {
                type: "article",
                id: "cat",
                title: `Cat for "${payload.query}"`,
                description: "A cat",
                input_message_content: { message_text: "<b>Cat</b> 🐈", parse_mode: "HTML" }
              }
            ]
          })
        )
      ])
    )
    render(<Chat port={port} botUsername="emulator_bot" />)
    const input = screen.getByTestId("chat-input")

    fireEvent.change(input, { target: { value: "@emulator_bot ca" } })
    await until(() => screen.queryByTestId("inline-result")?.textContent?.includes('"ca"') === true)

    fireEvent.click(screen.getByTestId("inline-result"))
    await until(() => document.querySelector('[data-testid="message"][data-from="user"]') !== null)
    const sent = document.querySelector('[data-testid="message"][data-from="user"]')
    expect(sent?.textContent).toContain("via @emulator_bot")
    expect(sent?.querySelector("strong")?.textContent).toBe("Cat")
    expect(screen.queryByTestId("inline-results")).toBeNull()
    expect(input).toHaveProperty("value", "")
  })
})
