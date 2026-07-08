import { assert, describe, expect } from "vitest"

import { fixture } from "./fixture"

const integration = process.env["bot_token"] && process.env["chat_id"]

describe.skipIf(!integration)("telegram bot client, download file (integration)", () => {
  fixture("get file content", async ({ client, chat_id }) => {
    const result = await client.executeSafe("send_document", {
      chat_id,
      document: {
        file_content: Buffer.from("Hello!"),
        file_name: "hello.txt"
      }
    })

    assert(result.ok, "send_document failed")

    const fileId = result.data.document?.file_id

    assert(fileId, "file id is null")

    const fileResult = await client.getFileSafe({ fileId })

    expect(fileResult.ok).toBe(true)
  })
})
