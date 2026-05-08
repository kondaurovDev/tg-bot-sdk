import type { Update } from "@effect-ak/tg-bot-api"
import { describe, expect, it } from "vitest"

import { extractUpdate } from "~/bot-processor"

const wrap = <K extends Exclude<keyof Update, "update_id">>(
  type: K,
  payload: NonNullable<Update[K]>
): Update => ({ update_id: 1, [type]: payload }) as Update

describe("extractUpdate", () => {
  it("extracts a `message` update", () => {
    const u = extractUpdate(
      wrap("message", {
        chat: { id: 1, type: "private" },
        date: 0,
        message_id: 1,
        text: "hi"
      })
    )
    expect(u?.type).toBe("message")
  })

  it("returns undefined for an update with no payload", () => {
    expect(extractUpdate({ update_id: 1 } as Update)).toBeUndefined()
  })

  it.each([
    [
      "edited_message",
      {
        chat: { id: 1, type: "private" },
        date: 0,
        message_id: 1,
        text: "edited"
      }
    ],
    [
      "channel_post",
      {
        chat: { id: 1, type: "channel" },
        date: 0,
        message_id: 1,
        text: "post"
      }
    ],
    [
      "edited_channel_post",
      {
        chat: { id: 1, type: "channel" },
        date: 0,
        message_id: 1,
        text: "edited post"
      }
    ],
    [
      "business_message",
      {
        chat: { id: 1, type: "private" },
        date: 0,
        message_id: 1,
        text: "biz"
      }
    ],
    [
      "edited_business_message",
      {
        chat: { id: 1, type: "private" },
        date: 0,
        message_id: 1,
        text: "biz edit"
      }
    ],
    [
      "callback_query",
      {
        id: "cb",
        from: { id: 1, is_bot: false, first_name: "A" },
        chat_instance: "x",
        data: "tap"
      }
    ],
    [
      "inline_query",
      {
        id: "iq",
        from: { id: 1, is_bot: false, first_name: "A" },
        query: "hello",
        offset: ""
      }
    ],
    [
      "chosen_inline_result",
      {
        result_id: "r",
        from: { id: 1, is_bot: false, first_name: "A" },
        query: "x"
      }
    ],
    [
      "shipping_query",
      {
        id: "s",
        from: { id: 1, is_bot: false, first_name: "A" },
        invoice_payload: "p",
        shipping_address: {
          country_code: "US",
          state: "",
          city: "",
          street_line1: "",
          street_line2: "",
          post_code: ""
        }
      }
    ],
    [
      "pre_checkout_query",
      {
        id: "pc",
        from: { id: 1, is_bot: false, first_name: "A" },
        currency: "USD",
        total_amount: 100,
        invoice_payload: "p"
      }
    ],
    ["poll", { id: "p", question: "?", options: [], total_voter_count: 0 }],
    [
      "poll_answer",
      {
        poll_id: "p",
        option_ids: [0]
      }
    ],
    [
      "my_chat_member",
      {
        chat: { id: 1, type: "private" },
        from: { id: 1, is_bot: false, first_name: "A" },
        date: 0,
        old_chat_member: { user: { id: 1, is_bot: false, first_name: "A" }, status: "member" },
        new_chat_member: { user: { id: 1, is_bot: false, first_name: "A" }, status: "left" }
      }
    ]
  ] as const)("extracts a `%s` update", (type, payload) => {
    const u = extractUpdate(wrap(type, payload as never))
    expect(u?.type).toBe(type)
  })

  it("ignores update_id when scanning fields", () => {
    const u = extractUpdate({
      update_id: 42,
      message: {
        chat: { id: 1, type: "private" },
        date: 0,
        message_id: 1,
        text: "x"
      }
    } as Update)
    expect(u?.type).toBe("message")
    // properties of the inner update should be flattened onto the result
    expect((u as { text?: string }).text).toBe("x")
  })
})
