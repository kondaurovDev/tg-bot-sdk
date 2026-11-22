import { describe, expect, vi } from "vitest"

import type { BotFullInfo } from "@effect-ak/tg-bot-api"

import { fixture } from "./fixture"

const fetchSpy = vi.spyOn(global, "fetch")

const integration = process.env["bot_token"] && process.env["chat_id"]

const botFullInfoFlags = [
  "can_join_groups",
  "can_read_all_group_messages",
  "supports_guest_queries",
  "supports_inline_queries",
  "needs_inline_query_location",
  "can_connect_to_business",
  "has_main_web_app",
  "has_topics_enabled",
  "allows_users_to_create_topics",
  "has_topic_sidebar",
  "can_manage_bots",
  "supports_join_request_queries"
] as const satisfies ReadonlyArray<keyof BotFullInfo>

describe.skipIf(!integration)("telegram bot client, execute method (integration)", () => {
  fixture("get_me returns the bot's full info (Bot API 10.5)", async ({ client }) => {
    const me = await client.execute("get_me", {})

    expect(me.is_bot).toBe(true)
    // Required in `BotFullInfo`: Telegram must send each of them
    for (const flag of botFullInfoFlags) expect(me[flag], flag).toBeTypeOf("boolean")
  })

  fixture("set_my_settings accepts a setting (Bot API 10.5)", async ({ client }) => {
    const me = await client.execute("get_me", {})

    // The value the bot already has, so the test leaves the bot as it was
    const result = await client.executeSafe("set_my_settings", {
      can_join_groups: me.can_join_groups
    })

    expect(result.ok).toBe(true)
  })

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
