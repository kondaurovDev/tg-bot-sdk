import { describe, expect, vi } from "vitest"

import { fixture } from "./fixture"

const fetchSpy = vi.spyOn(global, "fetch")

const integration = process.env["bot_token"] && process.env["chat_id"]

describe.skipIf(!integration)("telegram bot client, execute method (integration)", () => {
  fixture("send dice", async ({ chat_id, client }) => {
    const result = await client.executeSafe("send_dice", {
      chat_id,
      emoji: "🎲",
      message_effect_id: "🔥"
    })

    const url = fetchSpy.mock.calls[0][0] as string
    const lastPath = url.split("/").pop()

    expect(lastPath).toEqual("sendDice")

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.chat.id).toBeDefined()
    }
  })

  fixture("send message", async ({ chat_id, client }) => {
    const result = await client.executeSafe("send_message", {
      chat_id,
      text: "hey again",
      message_effect_id: "🔥"
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.chat.id).toBeDefined()
    }
  })

  fixture("send message with keyboard", async ({ chat_id, client }) => {
    const result = await client.executeSafe("send_message", {
      chat_id,
      text: "hey again!",
      message_effect_id: "🎉",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "api documentation",
              web_app: {
                url: "https://core.telegram.org/api"
              }
            }
          ]
        ]
      }
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.chat.id).toBeDefined()
    }
  })

  fixture("send document", async ({ chat_id, client }) => {
    const result = await client.executeSafe("send_document", {
      chat_id,
      message_effect_id: "🎉",
      document: {
        file_content: Buffer.from("Hello!"),
        file_name: "hello.txt"
      },
      caption: "simple text file"
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.document?.file_id).toBeDefined()
      expect(result.data.chat.id).toBeDefined()
    }
  })

  fixture("send message with action", async ({ chat_id, client }) => {
    await client.executeSafe("send_chat_action", {
      chat_id,
      action: "upload_voice"
    })

    await new Promise((res) => setTimeout(res, 5000))

    const result = await client.executeSafe("send_message", {
      chat_id,
      text: "hey again with typings",
      message_effect_id: "🔥"
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.chat.id).toBeDefined()
    }
  })
})
