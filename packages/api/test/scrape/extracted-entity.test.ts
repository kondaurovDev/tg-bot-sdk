import { describe, expect, assert } from "vitest"

import { fixture } from "~test/fixture/codegen-main"

describe("extracted-entity", () => {
  fixture("getUpdates", ({ apiPage }) => {
    const entity = apiPage.getMethod("getUpdates")

    if (entity._tag == "Left") console.log(entity.left)

    assert(entity._tag == "Right", "not right")
    expect(entity.right.returnType.getTsType("T")).toEqual("T.Update[]")
  })

  fixture("getAvailableGifts", ({ apiPage }) => {
    const entity = apiPage.getMethod("getAvailableGifts")

    if (entity._tag == "Left") console.log(entity.left)

    assert(entity._tag == "Right")
    assert(entity.right.returnType._tag == "NormalType")
  })

  fixture("ReactionTypeEmoji", ({ apiPage }) => {
    const entity = apiPage.getEntity("ReactionTypeEmoji")

    if (entity._tag == "Left") console.log(entity.left)

    assert(entity._tag == "Right")
    assert(entity.right.type._tag == "EntityFields")

    const field1 = entity.right.type.fields.find((_) => _.name == "emoji")

    expect(field1?.type.typeNames[0]).equals('"❤"')
  })

  fixture("answerCallbackQuery", ({ apiPage }) => {
    const entity = apiPage.getEntity("answerCallbackQuery")

    if (entity._tag == "Left") console.log(entity.left)

    assert(entity._tag == "Right")
  })

  fixture("InputFile", ({ apiPage }) => {
    const entity = apiPage.getEntity("InputFile")

    if (entity._tag == "Left") console.log(entity.left)

    assert(entity._tag == "Right")
    expect(entity.right.entityName).toEqual("InputFile")

    assert(entity.right.type._tag == "NormalType")
    expect(entity.right.type.getTsType()).toEqual(
      "{ file_content: Uint8Array, file_name: string }"
    )
  })

  fixture("sendMediaGroup", ({ apiPage }) => {
    const entity = apiPage.getEntity("sendMediaGroup")

    if (entity._tag == "Left") console.log(entity.left)

    assert(entity._tag == "Right")
    expect(entity.right.entityName).toEqual("sendMediaGroup")
    expect(entity.right.entityDescription.returns?.typeNames).toEqual([
      "Message[]"
    ])

    assert(entity.right.type._tag == "EntityFields")
    const field1 = entity.right.type.fields.find((_) => _.name == "media")

    expect(field1?.type.getTsType()).toEqual(
      "(T.InputMediaAudio | T.InputMediaDocument | T.InputMediaPhoto | T.InputMediaVideo)[]"
    )
  })

  fixture("setGameScore", ({ apiPage }) => {
    const entity = apiPage.getEntity("setGameScore")

    if (entity._tag == "Left") console.log(entity.left)

    assert(entity._tag == "Right")
    expect(entity.right.entityName).toEqual("setGameScore")
    expect(entity.right.entityDescription.returns?.typeNames).toEqual([
      "Message",
      "boolean"
    ])
  })

  fixture("getStarTransactions", ({ apiPage }) => {
    const entity = apiPage.getEntity("getStarTransactions")

    if (entity._tag == "Left") console.log(entity.left)

    assert(entity._tag == "Right")
    expect(entity.right.entityName).toEqual("getStarTransactions")
    expect(entity.right.entityDescription.returns?.typeNames).toEqual([
      "StarTransactions"
    ])
  })

  fixture("deleteMessage", ({ apiPage }) => {
    const entity = apiPage.getEntity("deleteMessage")

    if (entity._tag == "Left") console.log(entity.left)

    assert(entity._tag == "Right")
    expect(entity.right.entityName).toEqual("deleteMessage")
    expect(entity.right.entityDescription.returns?.typeNames).toEqual([
      "boolean"
    ])
  })

  fixture("getWebhookInfo", ({ apiPage }) => {
    const entity = apiPage.getEntity("getWebhookInfo")

    if (entity._tag == "Left") console.log(entity.left)

    assert(entity._tag == "Right")
    expect(entity.right.entityName).toEqual("getWebhookInfo")
    expect(entity.right.entityDescription.returns?.typeNames).toEqual([
      "WebhookInfo"
    ])
  })

  fixture("ReplyKeyboardMarkup", ({ apiPage }) => {
    const entity = apiPage.getEntity("ReplyKeyboardMarkup")

    if (entity._tag == "Left") console.log(entity.left)

    assert(entity._tag == "Right")
    expect(entity.right.entityName).toEqual("ReplyKeyboardMarkup")
    expect(entity.right.entityDescription.returns).toBeUndefined()
    assert(entity.right.type._tag == "EntityFields")

    const field1 = entity.right.type.fields.find((_) => _.name == "keyboard")

    expect(field1?.type.getTsType()).toEqual("KeyboardButton[][]")
  })

  fixture("User", ({ apiPage }) => {
    const entity = apiPage.getEntity("User")

    if (entity._tag == "Left") console.log(entity.left)

    assert(entity._tag == "Right")
    expect(entity.right.entityName).toEqual("User")
    expect(entity.right.entityDescription.returns).toBeUndefined()
    assert(entity.right.type._tag == "EntityFields")
    expect(entity.right.type.fields.map((_) => _.name)).containSubset([
      "id",
      "is_bot",
      "username"
    ])
  })

  fixture("forwardMessages", ({ apiPage }) => {
    const entity = apiPage.getEntity("forwardMessages")

    if (entity._tag == "Left") console.log(entity.left)

    assert(entity._tag == "Right")
    expect(entity.right.entityName).toEqual("forwardMessages")
    expect(entity.right.entityDescription.returns?.typeNames).toEqual([
      "MessageId[]"
    ])
  })

  fixture("Chat", ({ apiPage }) => {
    const entity = apiPage.getEntity("Chat")

    if (entity._tag == "Left") console.log(entity.left)

    assert(entity._tag == "Right")

    expect(entity.right.entityName).toEqual("Chat")
    expect(entity.right.entityDescription.lines[0]).toEqual(
      "This object represents a chat."
    )

    assert(entity.right.type._tag == "EntityFields")
    expect(entity.right.type.fields.length).greaterThan(1)

    const titleField = entity.right.type.fields.find((_) => _.name == "title")

    expect(titleField?.description.at(0)).toEqual(
      "Title, for supergroups, channels and group chats"
    )
    expect(titleField?.type.getTsType()).toEqual("string")
    expect(titleField?.required).toEqual(false)

    const typeField = entity.right.type.fields.find((_) => _.name == "type")

    expect(typeField?.description.at(0)).toEqual(
      "Type of the chat, can be either “private”, “group”, “supergroup” or “channel”"
    )
    expect(typeField?.type.getTsType()).toEqual(
      `"private" | "group" | "supergroup" | "channel"`
    )
  })

  fixture("Message", ({ apiPage }) => {
    const entity = apiPage.getEntity("Message")

    if (entity._tag == "Left") console.log(entity.left)

    assert(entity._tag == "Right")

    expect(entity.right.entityName).toEqual("Message")
    assert(entity.right.type._tag == "EntityFields")

    expect(entity.right.type.fields.length).greaterThan(80)
  })

  fixture("getMyCommands", ({ apiPage }) => {
    const entity = apiPage.getEntity("getMyCommands")

    if (entity._tag == "Left") console.log(entity.left)

    assert(entity._tag == "Right")

    expect(entity.right.entityName).toEqual("getMyCommands")
    assert(entity.right.type._tag == "EntityFields")

    expect(entity.right.type.fields).toHaveLength(2)
    expect(entity.right.entityDescription.returns?.typeNames).toEqual([
      "BotCommand[]"
    ])
  })

  fixture("logOut", ({ apiPage }) => {
    const entity = apiPage.getEntity("logOut")

    assert(entity._tag == "Right")

    expect(entity.right.entityName).toEqual("logOut")
    assert(entity.right.type._tag == "NormalType")

    expect(entity.right.type.getTsType()).toEqual("never")
    expect(entity.right.entityDescription.returns?.typeNames).toEqual([
      "boolean"
    ])
  })

  fixture("getMe", ({ apiPage }) => {
    const entity = apiPage.getEntity("getMe")

    assert(entity._tag == "Right")

    expect(entity.right.entityName).toEqual("getMe")
    assert(entity.right.type._tag == "NormalType")

    expect(entity.right.type.getTsType()).toEqual("never")
  })

  fixture("sendChatAction", ({ apiPage }) => {
    const entity = apiPage.getEntity("sendChatAction")

    assert(entity._tag == "Right")

    expect(entity.right.entityName).toEqual("sendChatAction")
    expect(entity.right.type._tag).toEqual("EntityFields")
  })

  fixture("ForumTopicClosed", async ({ apiPage }) => {
    const entity = apiPage.getEntity("forumTopicClosed")

    assert(entity._tag == "Right")

    assert(entity.right.type._tag == "NormalType")

    expect(entity.right.type.getTsType()).toEqual("never")

    // expect(entity.right.entityName).toEqual("forumTopicClosed");
    // expect(entity.right.type.type).toEqual("fields");
    // expect(entity.right.entityDescription).not.toEqual([]);
  })

  fixture("ChatFullInfo", ({ apiPage }) => {
    const entity = apiPage.getEntity("ChatFullInfo")

    assert(entity._tag == "Right")

    expect(entity.right.entityDescription.lines[0]).match(
      /^This object contains full.*/
    )

    assert(entity.right.type._tag == "EntityFields")

    const field1 = entity.right.type.fields.find(
      (_) => _.name == "accent_color_id"
    )

    expect(field1?.required).toBeTruthy()
    expect(field1?.type.getTsType()).toEqual("number")

    const field2 = entity.right.type.fields.find(
      (_) => _.name == "available_reactions"
    )
    expect(field2?.type.getTsType()).toEqual("ReactionType[]")
    expect(field2?.required).toBeFalsy()

    const lastNameField = entity.right.type.fields.find(
      (_) => _.name == "last_name"
    )
    expect(lastNameField?.type.getTsType()).toEqual("string")
    expect(lastNameField?.required).toBeFalsy()
    expect(lastNameField?.description).toEqual([
      "Last name of the other party in a private chat"
    ])
  })
})
