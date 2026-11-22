import { describe, expect, it } from "vitest"

import { loadBotApiSpec, type BotApiSpec, type SpecType } from "../src/spec"
import { makeValidator } from "../src/validate"

const string: SpecType = { kind: "primitive", name: "string" }
const integer: SpecType = { kind: "primitive", name: "integer" }
const float: SpecType = { kind: "primitive", name: "float" }
const boolean: SpecType = { kind: "primitive", name: "boolean" }
const ref = (name: string): SpecType => ({ kind: "ref", name })

const spec: BotApiSpec = {
  version: "test",
  methods: [
    { name: "getUser", return: ref("User"), parameters: [] },
    { name: "getUsers", return: { kind: "array", element: ref("User") }, parameters: [] },
    { name: "getMember", return: ref("Member"), parameters: [] },
    {
      name: "editText",
      return: { kind: "union", members: [ref("Message"), boolean] },
      parameters: []
    },
    { name: "getTarget", return: ref("MaybeMessage"), parameters: [] }
  ],
  types: [
    {
      name: "User",
      fields: [
        { name: "id", type: integer, required: true },
        { name: "name", type: string, required: true },
        { name: "rating", type: float, required: false },
        { name: "kind", type: { kind: "enum", values: ["human", "bot"] }, required: false }
      ]
    },
    {
      name: "Message",
      fields: [
        { name: "message_id", type: integer, required: true },
        { name: "from", type: ref("User"), required: false },
        { name: "text", type: string, required: false }
      ]
    },
    {
      name: "Gone",
      fields: [{ name: "message_id", type: integer, required: true }]
    },
    {
      name: "MaybeMessage",
      type: { kind: "union", members: [ref("Message"), ref("Gone")] }
    },
    {
      name: "MemberOwner",
      fields: [
        { name: "status", type: { kind: "enum", values: ["creator"] }, required: true },
        { name: "title", type: string, required: true }
      ]
    },
    {
      name: "MemberLeft",
      fields: [{ name: "status", type: { kind: "enum", values: ["left"] }, required: true }]
    },
    {
      name: "Member",
      type: {
        kind: "union",
        members: [ref("MemberOwner"), ref("MemberLeft")],
        discriminator: "status"
      }
    }
  ]
}

const { checkResult } = makeValidator(spec)
const found = (method: string, result: unknown) =>
  checkResult(method, result).map(({ kind, where, path }) => ({ kind, where, path }))

describe("validator", () => {
  it("accepts a value of the declared shape, optional fields absent or present", () => {
    expect(found("get_user", { id: 1, name: "Ann" })).toEqual([])
    expect(found("get_user", { id: 1, name: "Ann", rating: 4, kind: "bot" })).toEqual([])
    expect(found("get_user", { id: 1, name: "Ann", rating: 4.5 })).toEqual([])
  })

  it("reports a required field that did not come", () => {
    expect(found("get_user", { id: 1 })).toEqual([
      { kind: "missing-field", where: "User.name", path: "result.name" }
    ])
  })

  it("reports a field the spec does not have", () => {
    expect(found("get_user", { id: 1, name: "Ann", is_cool: true })).toEqual([
      { kind: "unknown-field", where: "User.is_cool", path: "result.is_cool" }
    ])
  })

  it("reports a value of another type, a float for an integer included", () => {
    expect(found("get_user", { id: 1.5, name: 7 })).toEqual([
      { kind: "wrong-type", where: "User.id", path: "result.id" },
      { kind: "wrong-type", where: "User.name", path: "result.name" }
    ])
    expect(found("get_user", null)).toEqual([
      { kind: "wrong-type", where: "getUser()", path: "result" }
    ])
  })

  it("reports a string outside the enum", () => {
    expect(found("get_user", { id: 1, name: "Ann", kind: "robot" })).toEqual([
      { kind: "unknown-enum-value", where: "User.kind", path: "result.kind" }
    ])
  })

  it("names the spec type and the response path of a nested value", () => {
    expect(found("get_users", [{ id: 1, name: "Ann" }, { id: 2 }])).toEqual([
      { kind: "missing-field", where: "User.name", path: "result[1].name" }
    ])
    expect(found("edit_text", { message_id: 1, from: { id: 1, name: "Ann", x: 1 } })).toEqual([
      { kind: "unknown-field", where: "User.x", path: "result.from.x" }
    ])
  })

  it("picks the member of a discriminated union by its tag", () => {
    expect(found("get_member", { status: "left" })).toEqual([])
    expect(found("get_member", { status: "creator" })).toEqual([
      { kind: "missing-field", where: "MemberOwner.title", path: "result.title" }
    ])
    expect(found("get_member", { status: "banned" })).toEqual([
      { kind: "unknown-variant", where: "Member.status", path: "result.status" }
    ])
  })

  it("reports on the best-fitting member of a union without a tag", () => {
    expect(found("edit_text", true)).toEqual([])
    expect(found("edit_text", { message_id: 1, text: "hi" })).toEqual([])
    // An object is judged as a Message, not dismissed as "not a boolean"
    expect(found("edit_text", { message_id: 1, extra: 1 })).toEqual([
      { kind: "unknown-field", where: "Message.extra", path: "result.extra" }
    ])
    // One unknown field as a Message beats two as a Gone
    expect(found("get_target", { message_id: 1, text: "hi", extra: 1 })).toEqual([
      { kind: "unknown-field", where: "Message.extra", path: "result.extra" }
    ])
    expect(found("get_target", { message_id: 1 })).toEqual([])
  })

  it("refuses a method the spec does not have", () => {
    expect(() => checkResult("no_such_method", true)).toThrow(/noSuchMethod/)
  })
})

describe("the generated spec", () => {
  const real = loadBotApiSpec()
  const validator = makeValidator(real)

  it("has a declaration behind every type it refers to", () => {
    // `AllowedUpdateName` exists only in the emitted TypeScript, as
    // `Exclude<keyof Update, "update_id">`; the JSON spec refers to it from two
    // parameters without declaring it. Results never contain it.
    const tsOnly = (dangling: string) => dangling.endsWith("-> AllowedUpdateName")
    expect(validator.danglingRefs().filter((dangling) => !tsOnly(dangling))).toEqual([])
  })

  it("validates a getMe response", () => {
    const me = {
      id: 1,
      is_bot: true,
      first_name: "Bot",
      username: "some_bot",
      can_join_groups: true,
      can_read_all_group_messages: false,
      supports_guest_queries: false,
      supports_inline_queries: false,
      needs_inline_query_location: false,
      can_connect_to_business: false,
      has_main_web_app: false,
      has_topics_enabled: false,
      allows_users_to_create_topics: false,
      has_topic_sidebar: false,
      can_manage_bots: false,
      supports_join_request_queries: false
    }
    expect(validator.checkResult("get_me", me)).toEqual([])
    expect(
      validator.checkResult("get_me", { ...me, last_name: "X" }).map((issue) => issue.where)
    ).toEqual(["BotFullInfo.last_name"])
  })
})
