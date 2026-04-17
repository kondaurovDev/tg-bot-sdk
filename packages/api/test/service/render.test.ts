import { describe, expect, it } from "vitest"

import {
  renderMethods,
  renderTypes,
  renderWebApp
} from "~/service/code-writers"
import { ExtractedWebApp } from "~/scrape/entities"
import { ExtractedType } from "~/scrape/entity"
import type { ExtractedMethodShape } from "~/scrape/entity"
import { EntityFields, NormalType } from "~/scrape/type-system"
import {
  enumOf,
  P,
  parsePseudoType,
  ref,
  union,
  type SpecType
} from "~/scrape/type"

// ── Helpers to build minimal fixtures ──

const toSpec = (tsType: string): SpecType => {
  // Translate a few common TS tokens used in tests back to a structured type.
  if (tsType === "string") return P.string
  if (tsType === "number") return P.integer
  if (tsType === "boolean") return P.boolean
  const parsed = parsePseudoType(tsType)
  return parsed ?? ref(tsType)
}

const field = (name: string, tsType: string, required = true) => ({
  name,
  type: NormalType.fromSpec(toSpec(tsType)),
  description: [],
  required
})

const interfaceType = (typeName: string, fields: ReturnType<typeof field>[]) =>
  new ExtractedType({
    typeName,
    description: [],
    type: new EntityFields({ fields })
  })

const aliasType = (
  typeName: string,
  variants: [string, string, ...string[]]
) =>
  new ExtractedType({
    typeName,
    description: [],
    type: NormalType.fromSpec(
      union(ref(variants[0]), ref(variants[1]), ...variants.slice(2).map(ref))
    )
  })

const method = (
  methodName: string,
  returnType: SpecType,
  parameters?: ReturnType<typeof field>[]
): ExtractedMethodShape => ({
  methodName,
  methodDescription: [],
  returnType: NormalType.fromSpec(returnType),
  parameters: parameters ? new EntityFields({ fields: parameters }) : undefined
})

// ── Snapshot tests ──
// These guard against accidental changes to the generated-code shape.
// Update with `vitest -u` if the change is intentional.

describe("renderTypes", () => {
  it("renders AllowedUpdateName alias, interfaces and unions", () => {
    const types = [
      interfaceType("User", [
        field("id", "number"),
        field("first_name", "string"),
        field("last_name", "string", false)
      ]),
      aliasType("ChatMember", ["ChatMemberOwner", "ChatMemberMember"])
    ]

    expect(renderTypes(types)).toMatchInlineSnapshot(`
      "// GENERATED CODE

      export type AllowedUpdateName = Exclude<keyof Update, "update_id">

      /**
       * @see https://tg-bot-sdk.website/api/types/user/
       */
      export interface User {
        id: number
        first_name: string
        last_name?: string
      }

      /**
       * @see https://tg-bot-sdk.website/api/types/chat-member/
       */
      export type ChatMember = ChatMemberOwner | ChatMemberMember
      "
    `)
  })
})

describe("renderMethods", () => {
  it("renders Api interface and per-method input interfaces", () => {
    const parseMode = {
      name: "parse_mode",
      type: NormalType.fromSpec(enumOf("HTML", "MarkdownV2")),
      description: [],
      required: false
    }
    const methods = [
      method("getMe", ref("User")),
      method("sendMessage", ref("Message"), [
        field("chat_id", "number"),
        field("text", "string"),
        parseMode
      ])
    ]

    expect(renderMethods(methods)).toMatchInlineSnapshot(`
      "// GENERATED CODE

      import * as T from "./types"

      export interface Api {
        /**
         * @see https://tg-bot-sdk.website/api/methods/get-me/
         */
        get_me(_: GetMeInput): T.User
        /**
         * @see https://tg-bot-sdk.website/api/methods/send-message/
         */
        send_message(_: SendMessageInput): T.Message
      }

      /**
       * @see https://tg-bot-sdk.website/api/methods/get-me/
       */
      export interface GetMeInput {}

      /**
       * @see https://tg-bot-sdk.website/api/methods/send-message/
       */
      export interface SendMessageInput {
        chat_id: number
        text: string
        parse_mode?: "HTML" | "MarkdownV2"
      }
      "
    `)
  })
})

describe("renderWebApp", () => {
  it("renders WebApp interface plus extracted types", () => {
    const webapp = new ExtractedWebApp({
      webapp: {
        entityName: "WebApp",
        entityDescription: { lines: [], returns: undefined },
        type: new EntityFields({ fields: [] })
      },
      fields: [
        field("version", "string"),
        field("isExpanded", "boolean")
      ],
      types: [
        interfaceType("ThemeParams", [
          field("bg_color", "string", false)
        ])
      ]
    })

    expect(renderWebApp(webapp)).toMatchInlineSnapshot(`
      "// GENERATED CODE

      import type * as T from "../event-handlers"

      export interface WebApp {
        version: string
        isExpanded: boolean
      }

      export interface ThemeParams {
        bg_color?: string
      }
      "
    `)
  })
})
