import { describe, expect, it, assert } from "vitest"

import {
  makeNormalTypeFromPseudoTypes,
  extractEnumFromTypeDescription
} from "~/scrape/type-system"

describe("normal type", () => {
  it("make normal type from pseudo types", async () => {
    const check = (pseudo: string, expected: string[]) => {
      const t = makeNormalTypeFromPseudoTypes(pseudo)
      assert(t._tag == "Right")
      expect(t.right.typeNames).toEqual(expected)
    }

    check("String or Integer", ["string", "number"])
    check("Boolean", ["boolean"])
    check("True", ["boolean"])
    check("Array of String", ["string[]"])
    check("Array of Integer", ["number[]"])
    check("Array of ChatObject", ["ChatObject[]"])
  })

  it("extract enum from type description", () => {
    const check = (description: string[], expected: string[]) => {
      const actual = extractEnumFromTypeDescription(description)
      expect(actual).toEqual(expected)
    }

    check(["Type of the reaction, always \u201Cpaid\u201D"], ["paid"])

    check(
      ["Format of the sticker, must be one of \u201Cstatic\u201D, \u201Canimated\u201D, \u201Cvideo\u201D"],
      ["static", "animated", "video"]
    )

    check(
      [
        "MIME type of the thumbnail, must be one of \u201Cimage/jpeg\u201D, \u201Cimage/gif\u201D, or \u201Cvideo/mp4\u201D."
      ],
      ["image/jpeg", "image/gif", "video/mp4"]
    )

    check(["Type of the result, must be gif"], ["gif"])

    check(
      ["The member's status in the chat, always \u201Crestricted\u201D"],
      ["restricted"]
    )

    check(["Nothing"], [])

    check([`Currently, it can be one of "\u{1F44D}", "\u{1F44E}", "\u2764"`], ["\u{1F44D}", "\u{1F44E}", "\u2764"])

    check(
      [
        `Type of the chat, can be either \u201Cprivate\u201D, \u201Cgroup\u201D, \u201Csupergroup\u201D or \u201Cchannel\u201D`
      ],
      ["private", "group", "supergroup", "channel"]
    )
  })
})
