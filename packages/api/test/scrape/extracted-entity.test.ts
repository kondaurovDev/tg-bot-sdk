import { describe, expect, assert } from "vitest"

import { fixture } from "~test/fixture/codegen-main"
import { expectRight } from "~test/fixture/either"
import { renderTypeToTs, type SpecType } from "~/scrape/type"

const returnAs = (spec: SpecType | undefined): string | undefined =>
  spec ? renderTypeToTs(spec) : undefined

describe("extracted-entity", () => {
  fixture("getUpdates", ({ apiPage }) => {
    const m = expectRight(apiPage.getMethod("getUpdates"), "getMethod(getUpdates)")
    expect(m.returnType.getTsType("T")).toEqual("T.Update[]")
  })

  fixture("getAvailableGifts", ({ apiPage }) => {
    const m = expectRight(apiPage.getMethod("getAvailableGifts"), "getMethod(getAvailableGifts)")
    assert(m.returnType._tag == "NormalType")
  })

  fixture("ReactionTypeEmoji", ({ apiPage }) => {
    const e = expectRight(apiPage.getEntity("ReactionTypeEmoji"), "getEntity(ReactionTypeEmoji)")
    assert(e.type._tag == "EntityFields")

    const emoji = e.type.fields.find((_) => _.name == "emoji")
    const spec = emoji?.type.toSpec()
    assert(spec?.kind === "enum", "expected enum")
    expect(spec.values[0]).toEqual("❤")
  })

  fixture("answerCallbackQuery", ({ apiPage }) => {
    expectRight(apiPage.getEntity("answerCallbackQuery"), "getEntity(answerCallbackQuery)")
  })

  fixture("InputFile", ({ apiPage }) => {
    const e = expectRight(apiPage.getEntity("InputFile"), "getEntity(InputFile)")
    expect(e.entityName).toEqual("InputFile")
    assert(e.type._tag == "NormalType")
    expect(e.type.getTsType()).toEqual("{ file_content: Uint8Array, file_name: string }")
  })

  fixture("sendMediaGroup", ({ apiPage }) => {
    const e = expectRight(apiPage.getEntity("sendMediaGroup"), "getEntity(sendMediaGroup)")
    expect(e.entityName).toEqual("sendMediaGroup")
    expect(returnAs(e.entityDescription.returns)).toEqual("Message[]")

    assert(e.type._tag == "EntityFields")
    const media = e.type.fields.find((_) => _.name == "media")
    expect(media?.type.getTsType("T")).toEqual(
      "(T.InputMediaAudio | T.InputMediaDocument | T.InputMediaPhoto | T.InputMediaVideo)[]"
    )
  })

  fixture("setGameScore", ({ apiPage }) => {
    const e = expectRight(apiPage.getEntity("setGameScore"), "getEntity(setGameScore)")
    expect(e.entityName).toEqual("setGameScore")
    expect(returnAs(e.entityDescription.returns)).toEqual("Message | boolean")
  })

  fixture("getStarTransactions", ({ apiPage }) => {
    const e = expectRight(
      apiPage.getEntity("getStarTransactions"),
      "getEntity(getStarTransactions)"
    )
    expect(e.entityName).toEqual("getStarTransactions")
    expect(returnAs(e.entityDescription.returns)).toEqual("StarTransactions")
  })

  fixture("deleteMessage", ({ apiPage }) => {
    const e = expectRight(apiPage.getEntity("deleteMessage"), "getEntity(deleteMessage)")
    expect(e.entityName).toEqual("deleteMessage")
    expect(returnAs(e.entityDescription.returns)).toEqual("boolean")
  })

  fixture("getWebhookInfo", ({ apiPage }) => {
    const e = expectRight(apiPage.getEntity("getWebhookInfo"), "getEntity(getWebhookInfo)")
    expect(e.entityName).toEqual("getWebhookInfo")
    expect(returnAs(e.entityDescription.returns)).toEqual("WebhookInfo")
  })

  fixture("ReplyKeyboardMarkup", ({ apiPage }) => {
    const e = expectRight(
      apiPage.getEntity("ReplyKeyboardMarkup"),
      "getEntity(ReplyKeyboardMarkup)"
    )
    expect(e.entityName).toEqual("ReplyKeyboardMarkup")
    expect(e.entityDescription.returns).toBeUndefined()
    assert(e.type._tag == "EntityFields")

    const keyboard = e.type.fields.find((_) => _.name == "keyboard")
    expect(keyboard?.type.getTsType()).toEqual("KeyboardButton[][]")
  })

  fixture("User", ({ apiPage }) => {
    const e = expectRight(apiPage.getEntity("User"), "getEntity(User)")
    expect(e.entityName).toEqual("User")
    expect(e.entityDescription.returns).toBeUndefined()
    assert(e.type._tag == "EntityFields")
    expect(e.type.fields.map((_) => _.name)).containSubset(["id", "is_bot", "username"])
  })

  fixture("forwardMessages", ({ apiPage }) => {
    const e = expectRight(apiPage.getEntity("forwardMessages"), "getEntity(forwardMessages)")
    expect(e.entityName).toEqual("forwardMessages")
    expect(returnAs(e.entityDescription.returns)).toEqual("MessageId[]")
  })

  fixture("Chat", ({ apiPage }) => {
    const e = expectRight(apiPage.getEntity("Chat"), "getEntity(Chat)")

    expect(e.entityName).toEqual("Chat")
    expect(e.entityDescription.lines[0]).toEqual("This object represents a chat.")

    assert(e.type._tag == "EntityFields")
    // Invariant: Chat must always have these core fields, regardless of how
    // Telegram extends it later.
    const fieldNames = e.type.fields.map((_) => _.name)
    expect(fieldNames).containSubset(["id", "type"])

    const titleField = e.type.fields.find((_) => _.name == "title")
    expect(titleField?.description.at(0)).toEqual(
      "Title, for supergroups, channels and group chats"
    )
    expect(titleField?.type.getTsType()).toEqual("string")
    expect(titleField?.required).toEqual(false)

    const typeField = e.type.fields.find((_) => _.name == "type")
    expect(typeField?.type.getTsType()).toEqual(`"private" | "group" | "supergroup" | "channel"`)
  })

  fixture("Message", ({ apiPage }) => {
    const e = expectRight(apiPage.getEntity("Message"), "getEntity(Message)")
    expect(e.entityName).toEqual("Message")
    assert(e.type._tag == "EntityFields")

    // Invariant — these are the core fields that have always been present.
    // Avoid asserting the absolute count: Telegram adds/removes fields each
    // release and the test would flap.
    const fieldNames = e.type.fields.map((_) => _.name)
    expect(fieldNames).containSubset(["message_id", "chat", "date"])
  })

  fixture("getMyCommands", ({ apiPage }) => {
    const e = expectRight(apiPage.getEntity("getMyCommands"), "getEntity(getMyCommands)")
    expect(e.entityName).toEqual("getMyCommands")
    assert(e.type._tag == "EntityFields")

    expect(e.type.fields).toHaveLength(2)
    expect(returnAs(e.entityDescription.returns)).toEqual("BotCommand[]")
  })

  fixture("logOut", ({ apiPage }) => {
    const e = expectRight(apiPage.getEntity("logOut"), "getEntity(logOut)")
    expect(e.entityName).toEqual("logOut")
    assert(e.type._tag == "NormalType")
    expect(e.type.getTsType()).toEqual("never")
    expect(returnAs(e.entityDescription.returns)).toEqual("boolean")
  })

  fixture("getMe", ({ apiPage }) => {
    const e = expectRight(apiPage.getEntity("getMe"), "getEntity(getMe)")
    expect(e.entityName).toEqual("getMe")
    assert(e.type._tag == "NormalType")
    expect(e.type.getTsType()).toEqual("never")
  })

  fixture("sendChatAction", ({ apiPage }) => {
    const e = expectRight(apiPage.getEntity("sendChatAction"), "getEntity(sendChatAction)")
    expect(e.entityName).toEqual("sendChatAction")
    expect(e.type._tag).toEqual("EntityFields")
  })

  fixture("ForumTopicClosed", ({ apiPage }) => {
    const e = expectRight(apiPage.getEntity("forumTopicClosed"), "getEntity(forumTopicClosed)")
    assert(e.type._tag == "NormalType")
    expect(e.type.getTsType()).toEqual("never")
  })

  fixture("ChatFullInfo", ({ apiPage }) => {
    const e = expectRight(apiPage.getEntity("ChatFullInfo"), "getEntity(ChatFullInfo)")

    expect(e.entityDescription.lines[0]).match(/^This object contains full.*/)

    assert(e.type._tag == "EntityFields")

    const accent = e.type.fields.find((_) => _.name == "accent_color_id")
    expect(accent?.required).toBeTruthy()
    expect(accent?.type.getTsType()).toEqual("number")

    const reactions = e.type.fields.find((_) => _.name == "available_reactions")
    expect(reactions?.type.getTsType()).toEqual("ReactionType[]")
    expect(reactions?.required).toBeFalsy()

    const lastName = e.type.fields.find((_) => _.name == "last_name")
    expect(lastName?.type.getTsType()).toEqual("string")
    expect(lastName?.required).toBeFalsy()
    expect(lastName?.description).toEqual(["Last name of the other party in a private chat"])
  })
})
