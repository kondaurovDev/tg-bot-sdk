/**
 * The generated types as a user of the package meets them, pinned at the
 * type level. `scrape/spec-invariants.test.ts` checks the spec against the
 * docs; this checks the emitted `.ts`: a shape that code downstream relies on
 * and that changes (upstream, or by a scraper or emitter mistake) fails here,
 * by name. The assertions are checked by `tsc`; vitest only loads the file.
 */
import { describe, expectTypeOf, it } from "vitest"

import type {
  Api,
  BotFullInfo,
  CallbackQuery,
  InputRichBlock,
  InputRichBlockExpandableBlockQuotation,
  RichBlock,
  RichBlockExpandableBlockQuotation,
  SetMySettingsInput,
  User,
  WriteAccessAllowed
} from "../../src"

describe("bot settings (Bot API 10.5)", () => {
  it("get_me returns the bot's full info, not a User", () => {
    expectTypeOf<Api["get_me"]>().returns.toEqualTypeOf<BotFullInfo>()

    // What only get_me filled is required there and gone from User
    expectTypeOf<BotFullInfo["can_join_groups"]>().toEqualTypeOf<boolean>()
    expectTypeOf<BotFullInfo["supports_inline_queries"]>().toEqualTypeOf<boolean>()
    expectTypeOf<BotFullInfo["has_topic_sidebar"]>().toEqualTypeOf<boolean>()
    expectTypeOf<User>().not.toHaveProperty("can_join_groups")
    expectTypeOf<User>().not.toHaveProperty("supports_inline_queries")

    expectTypeOf<BotFullInfo["username"]>().toEqualTypeOf<string | undefined>()
    expectTypeOf<BotFullInfo["active_usernames"]>().toEqualTypeOf<string[] | undefined>()
    expectTypeOf<BotFullInfo["inline_query_placeholder"]>().toEqualTypeOf<string | undefined>()

    // Still passes where only the identity of a User is needed
    expectTypeOf<BotFullInfo>().toExtend<Pick<User, "id" | "is_bot" | "first_name" | "username">>()
  })

  it("set_my_settings takes any subset of the settings", () => {
    expectTypeOf<Api["set_my_settings"]>().returns.toEqualTypeOf<boolean>()
    expectTypeOf<Api["set_my_settings"]>().toBeCallableWith({})
    expectTypeOf<Api["set_my_settings"]>().toBeCallableWith({
      supports_inline_queries: true,
      inline_query_placeholder: "Search…",
      inline_feedback_share_denominator: 10,
      callback_query_mode: "inline"
    })
    expectTypeOf<SetMySettingsInput["callback_query_mode"]>().toEqualTypeOf<
      "default" | "auto" | "inline" | undefined
    >()
  })

  it("a callback query carries either its message or an inline message id", () => {
    expectTypeOf<CallbackQuery["message"]>().toBeNullable()
    expectTypeOf<CallbackQuery["inline_message_id"]>().toEqualTypeOf<string | undefined>()
  })
})

describe("rich messages (Bot API 10.5)", () => {
  it("an expandable block quotation holds blocks, not a text", () => {
    expectTypeOf<RichBlockExpandableBlockQuotation["blocks"]>().toEqualTypeOf<RichBlock[]>()
    expectTypeOf<RichBlockExpandableBlockQuotation>().not.toHaveProperty("text")
    expectTypeOf<InputRichBlockExpandableBlockQuotation["blocks"]>().toEqualTypeOf<
      InputRichBlock[]
    >()
    expectTypeOf<InputRichBlockExpandableBlockQuotation>().not.toHaveProperty("text")
  })
})

describe("service messages (Bot API 10.5)", () => {
  it("write_access_allowed names the owner who invited the user", () => {
    expectTypeOf<WriteAccessAllowed["inviter"]>().toEqualTypeOf<User | undefined>()
  })
})
