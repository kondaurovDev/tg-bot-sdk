import { describe, expect, it } from "vitest"

import { makeTgBotEmulator } from "~/emulator"

describe("media methods", () => {
  it("send_photo stores a photo message with parsed caption", async () => {
    const emulator = makeTgBotEmulator()
    const message = await emulator.client.execute("send_photo", {
      chat_id: emulator.chat.id,
      photo: "some-file-id",
      caption: "<i>nice</i>",
      parse_mode: "HTML"
    })

    expect(message.photo?.[0]?.file_id).toBe("some-file-id")
    expect(message.caption).toBe("nice")
    expect(message.caption_entities).toEqual([{ type: "italic", offset: 0, length: 4 }])
  })

  it("uploaded documents round-trip through getFile", async () => {
    const emulator = makeTgBotEmulator()
    const content = new TextEncoder().encode("hello file")

    const message = await emulator.client.execute("send_document", {
      chat_id: emulator.chat.id,
      document: { file_content: content, file_name: "hello.txt" }
    })

    const fileId = message.document!.file_id
    expect(message.document?.file_name).toBe("hello.txt")

    const file = await emulator.client.getFile({ fileId })
    expect(new TextDecoder().decode(file.content)).toBe("hello file")
    expect(file.file_name).toBe("hello.txt")
  })

  it("get_file fails for unknown ids", async () => {
    const emulator = makeTgBotEmulator()
    const result = await emulator.client.getFileSafe({ fileId: "nope" })
    expect(result).toMatchObject({ ok: false, error: { _tag: "UnableToGetFile" } })
  })

  it("send_dice returns a value in range", async () => {
    const emulator = makeTgBotEmulator()
    const message = await emulator.client.execute("send_dice", {
      chat_id: emulator.chat.id
    })

    expect(message.dice?.emoji).toBe("🎲")
    expect(message.dice!.value).toBeGreaterThanOrEqual(1)
    expect(message.dice!.value).toBeLessThanOrEqual(6)
  })

  it("reply_parameters embeds the replied-to message", async () => {
    const emulator = makeTgBotEmulator()
    const original = emulator.sendMessage("original")

    const reply = await emulator.client.execute("send_message", {
      chat_id: emulator.chat.id,
      text: "a reply",
      reply_parameters: { message_id: original.message_id }
    })

    expect(reply.reply_to_message?.message_id).toBe(original.message_id)
  })
})

describe("chat-level methods", () => {
  it("send_chat_action emits an event", async () => {
    const emulator = makeTgBotEmulator()
    const events: string[] = []
    emulator.subscribe((e) => {
      if (e.type === "chat_action") events.push(e.action)
    })

    await emulator.client.execute("send_chat_action", {
      chat_id: emulator.chat.id,
      action: "typing"
    })

    expect(events).toEqual(["typing"])
  })

  it("set_message_reaction stores and clears reactions", async () => {
    const emulator = makeTgBotEmulator()
    const message = emulator.sendMessage("react to me")

    await emulator.client.execute("set_message_reaction", {
      chat_id: emulator.chat.id,
      message_id: message.message_id,
      reaction: [{ type: "emoji", emoji: "👍" }]
    })
    expect(emulator.reactions[message.message_id]).toEqual(["👍"])

    await emulator.client.execute("set_message_reaction", {
      chat_id: emulator.chat.id,
      message_id: message.message_id,
      reaction: []
    })
    expect(emulator.reactions[message.message_id]).toBeUndefined()
  })

  it("forward and copy create new messages", async () => {
    const emulator = makeTgBotEmulator()
    const original = emulator.sendMessage("source")

    const forwarded = await emulator.client.execute("forward_message", {
      chat_id: emulator.chat.id,
      from_chat_id: emulator.chat.id,
      message_id: original.message_id
    })
    expect(forwarded.forward_origin).toBeDefined()
    expect(forwarded.text).toBe("source")

    const copied = await emulator.client.execute("copy_message", {
      chat_id: emulator.chat.id,
      from_chat_id: emulator.chat.id,
      message_id: original.message_id
    })
    const copy = emulator.messages.find((m) => m.message_id === copied.message_id)
    expect(copy?.text).toBe("source")
    expect(copy?.forward_origin).toBeUndefined()
  })
})
