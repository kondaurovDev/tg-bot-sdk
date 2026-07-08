import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { makePayload, TgBotClientError } from "~/execute"
import { makeTgBotClient } from "~/client"

const TOKEN = "TEST_TOKEN"
const CHAT_ID = 12345

const makeOkResponse = (result: unknown) =>
  new Response(JSON.stringify({ ok: true, result }), {
    status: 200,
    headers: { "content-type": "application/json" }
  })

const makeErrResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  })

describe("makePayload", () => {
  it("returns undefined for empty input", () => {
    expect(makePayload({})).toBeUndefined()
  })

  it("stringifies primitive fields", () => {
    const payload = makePayload({ chat_id: 1, text: "hi", flag: true })
    expect(payload).toBeInstanceOf(FormData)
    expect(payload?.get("chat_id")).toBe("1")
    expect(payload?.get("text")).toBe("hi")
    expect(payload?.get("flag")).toBe("true")
  })

  it("skips nullish values but keeps 0, false and empty strings", () => {
    const payload = makePayload({
      chat_id: 1,
      zero: 0,
      falsy: false,
      empty: "",
      nullish: null,
      missing: undefined
    })
    expect(payload?.get("chat_id")).toBe("1")
    expect(payload?.get("zero")).toBe("0")
    expect(payload?.get("falsy")).toBe("false")
    expect(payload?.get("empty")).toBe("")
    expect(payload?.has("nullish")).toBe(false)
    expect(payload?.has("missing")).toBe(false)
  })

  it("serializes objects as JSON", () => {
    const reply_markup = { inline_keyboard: [[{ text: "ok", callback_data: "x" }]] }
    const payload = makePayload({ chat_id: 1, reply_markup })
    expect(payload?.get("reply_markup")).toBe(JSON.stringify(reply_markup))
  })

  it("attaches file_content as Blob with file_name", () => {
    const bytes = new Uint8Array([1, 2, 3, 4])
    const payload = makePayload({
      chat_id: 1,
      document: { file_content: bytes, file_name: "x.bin" }
    })
    const value = payload?.get("document")
    expect(value).toBeInstanceOf(Blob)
    expect((value as File | (Blob & { name?: string })).name ?? "x.bin").toBe("x.bin")
  })

  it("attaches File and Blob values as-is", () => {
    const file = new File([new Uint8Array([1, 2])], "report.pdf")
    const payload = makePayload({ chat_id: 1, document: file })
    const value = payload?.get("document")
    expect(value).toBeInstanceOf(File)
    expect((value as File).name).toBe("report.pdf")
  })
})

describe("executeSafe", () => {
  // vi.spyOn(global, "fetch") returns a heavily overloaded type — keep it loose.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch")
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  const client = makeTgBotClient({ bot_token: TOKEN })

  it("converts snake_case method to camelCase URL path", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse({ message_id: 1 }))

    await client.executeSafe("send_message", { chat_id: CHAT_ID, text: "hi" })

    const url = fetchSpy.mock.calls[0]![0] as string
    expect(url).toBe(`https://api.telegram.org/bot${TOKEN}/sendMessage`)
  })

  it("uses custom base_url when configured", async () => {
    const custom = makeTgBotClient({
      bot_token: TOKEN,
      base_url: "https://example.test"
    })
    fetchSpy.mockResolvedValueOnce(makeOkResponse({}))

    await custom.executeSafe("get_me", {})

    const url = fetchSpy.mock.calls[0]![0] as string
    expect(url).toBe(`https://example.test/bot${TOKEN}/getMe`)
  })

  it("sends a POST with FormData body and an abort signal", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse({ message_id: 1 }))

    await client.executeSafe("send_message", { chat_id: CHAT_ID, text: "hi" })

    const init = fetchSpy.mock.calls[0]![1] as RequestInit
    expect(init.method).toBe("POST")
    expect(init.body).toBeInstanceOf(FormData)
    expect(init.signal).toBeInstanceOf(AbortSignal)
    const body = init.body as FormData
    expect(body.get("chat_id")).toBe(String(CHAT_ID))
    expect(body.get("text")).toBe("hi")
  })

  it("translates message_effect_id emoji to Telegram effect id", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse({ message_id: 1 }))

    await client.executeSafe("send_message", {
      chat_id: CHAT_ID,
      text: "hi",
      message_effect_id: "🔥"
    } as never)

    const body = fetchSpy.mock.calls[0]![1]!.body as FormData
    expect(body.get("message_effect_id")).toBe("5104841245755180586")
  })

  it("passes through an unknown message_effect_id verbatim", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse({ message_id: 1 }))

    await client.executeSafe("send_message", {
      chat_id: CHAT_ID,
      text: "hi",
      message_effect_id: "raw-id-123"
    } as never)

    const body = fetchSpy.mock.calls[0]![1]!.body as FormData
    expect(body.get("message_effect_id")).toBe("raw-id-123")
  })

  it("attaches document as multipart blob with file_name", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse({ document: { file_id: "f1" } }))

    await client.executeSafe("send_document", {
      chat_id: CHAT_ID,
      document: {
        file_content: Buffer.from("hello"),
        file_name: "hello.txt"
      }
    })

    const body = fetchSpy.mock.calls[0]![1]!.body as FormData
    const blob = body.get("document")
    expect(blob).toBeInstanceOf(Blob)
  })

  it("sends null body for methods called with empty input", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse({ id: 1, is_bot: true }))

    await client.executeSafe("get_me", {})

    const init = fetchSpy.mock.calls[0]![1] as RequestInit
    expect(init.body).toBeNull()
  })

  it("returns ok=true with parsed result", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse({ id: 1, is_bot: true, first_name: "Bot" }))

    const result = await client.executeSafe("get_me", {})

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toMatchObject({ id: 1, is_bot: true })
    }
  })

  it("returns NotOkResponse with errorCode/details when telegram rejects", async () => {
    fetchSpy.mockResolvedValueOnce(
      makeErrResponse(400, {
        ok: false,
        error_code: 400,
        description: "Bad Request: chat not found"
      })
    )

    const result = await client.executeSafe("send_message", {
      chat_id: CHAT_ID,
      text: "hi"
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error._tag).toBe("NotOkResponse")
      if (result.error._tag === "NotOkResponse") {
        expect(result.error.errorCode).toBe(400)
        expect(result.error.details).toBe("Bad Request: chat not found")
      }
    }
  })

  it("returns NotOkResponse when telegram replies ok=false with HTTP 200", async () => {
    fetchSpy.mockResolvedValueOnce(
      makeErrResponse(200, {
        ok: false,
        error_code: 429,
        description: "Too Many Requests"
      })
    )

    const result = await client.executeSafe("get_me", {})

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error._tag).toBe("NotOkResponse")
    }
  })

  it("returns ClientInternalError when fetch throws", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("network down"))

    const result = await client.executeSafe("get_me", {})

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error._tag).toBe("ClientInternalError")
    }
  })

  it("returns RequestTimeout when the request times out", async () => {
    fetchSpy.mockRejectedValueOnce(new DOMException("The operation timed out.", "TimeoutError"))

    const result = await client.executeSafe("get_me", {}, { timeout: 5000 })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toEqual({ _tag: "RequestTimeout", timeoutMs: 5000 })
    }
  })

  it("aborts the request when the timeout elapses", async () => {
    vi.useFakeTimers()
    try {
      fetchSpy.mockImplementationOnce(
        (_: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () => reject(init.signal!.reason))
          })
      )

      const pending = client.executeSafe("get_me", {}, { timeout: 100 })
      await vi.advanceTimersByTimeAsync(200)
      const result = await pending

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error._tag).toBe("RequestTimeout")
      }
    } finally {
      vi.useRealTimers()
    }
  })

  it("respects an external abort signal", async () => {
    fetchSpy.mockImplementationOnce(
      (_: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(init.signal!.reason))
        })
    )

    const controller = new AbortController()
    const pending = client.executeSafe("get_me", {}, { signal: controller.signal })
    controller.abort(new Error("stop it"))
    const result = await pending

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error._tag).toBe("ClientInternalError")
    }
  })

  it("returns NotJsonResponse when body is not JSON", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response("<html>oops</html>", {
        status: 200,
        headers: { "content-type": "text/html" }
      })
    )

    const result = await client.executeSafe("get_me", {})

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error._tag).toBe("NotJsonResponse")
    }
  })

  it("returns UnexpectedResponse when JSON has no `ok` field", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ result: "weird" }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    )

    const result = await client.executeSafe("get_me", {})

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error._tag).toBe("UnexpectedResponse")
    }
  })
})

describe("execute", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch")
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  const client = makeTgBotClient({ bot_token: TOKEN })

  it("returns the result payload directly", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse({ id: 1, is_bot: true, first_name: "Bot" }))

    const me = await client.execute("get_me", {})

    expect(me).toMatchObject({ id: 1, is_bot: true })
  })

  it("throws TgBotClientError with the failure reason", async () => {
    fetchSpy.mockResolvedValueOnce(
      makeErrResponse(400, {
        ok: false,
        error_code: 400,
        description: "Bad Request: chat not found"
      })
    )

    const promise = client.execute("send_message", {
      chat_id: CHAT_ID,
      text: "hi"
    })

    await expect(promise).rejects.toBeInstanceOf(TgBotClientError)
    await expect(promise).rejects.toMatchObject({
      name: "TgBotClientError",
      message: "Telegram API returned an error (400): Bad Request: chat not found",
      reason: {
        _tag: "NotOkResponse",
        errorCode: 400,
        details: "Bad Request: chat not found"
      }
    })
  })

  it("throws TgBotClientError with the original cause on network failure", async () => {
    const networkError = new Error("network down")
    fetchSpy.mockRejectedValueOnce(networkError)

    await expect(client.execute("get_me", {})).rejects.toMatchObject({
      reason: { _tag: "ClientInternalError", cause: networkError },
      cause: networkError
    })
  })
})

describe("getFile", () => {
  // vi.spyOn(global, "fetch") returns a heavily overloaded type — keep it loose.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch")
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  const client = makeTgBotClient({ bot_token: TOKEN })

  it("downloads file content using the file_path returned by get_file", async () => {
    fetchSpy
      .mockResolvedValueOnce(makeOkResponse({ file_id: "f1", file_path: "documents/x.bin" }))
      .mockResolvedValueOnce(new Response(new Uint8Array([1, 2, 3]), { status: 200 }))

    const file = await client.getFile({ fileId: "f1" })

    expect(fetchSpy.mock.calls).toHaveLength(2)
    const downloadUrl = fetchSpy.mock.calls[1]![0] as string
    expect(downloadUrl).toBe(`https://api.telegram.org/file/bot${TOKEN}/documents/x.bin`)

    expect(file.file_name).toBe("documents-x.bin")
    expect(new Uint8Array(file.content)).toEqual(new Uint8Array([1, 2, 3]))
    expect(file.base64String()).toBe(Buffer.from([1, 2, 3]).toString("base64"))
  })

  it("throws TgBotClientError when telegram returns no file_path", async () => {
    fetchSpy.mockResolvedValueOnce(makeOkResponse({ file_id: "f1" }))

    await expect(client.getFile({ fileId: "f1" })).rejects.toMatchObject({
      name: "TgBotClientError",
      reason: { _tag: "UnableToGetFile" }
    })
  })

  it("getFileSafe returns UnableToGetFile when download fetch throws", async () => {
    fetchSpy
      .mockResolvedValueOnce(makeOkResponse({ file_id: "f1", file_path: "documents/x.bin" }))
      .mockRejectedValueOnce(new Error("connection refused"))

    const result = await client.getFileSafe({ fileId: "f1" })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error._tag).toBe("UnableToGetFile")
    }
  })

  it("getFileSafe propagates the underlying error if get_file fails", async () => {
    fetchSpy.mockResolvedValueOnce(
      makeErrResponse(404, {
        ok: false,
        error_code: 404,
        description: "file not found"
      })
    )

    const result = await client.getFileSafe({ fileId: "missing" })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error._tag).toBe("NotOkResponse")
    }
  })
})
