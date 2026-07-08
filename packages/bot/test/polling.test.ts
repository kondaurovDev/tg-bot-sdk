import type { Update } from "@effect-ak/tg-bot-api"
import type { TgBotClient } from "@effect-ak/tg-bot-client"
import { describe, expect, it, vi } from "vitest"

import { UpdateFetcher, makePollSettings, type PollSettings } from "~/polling"

const silentLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {}
}

const baseSettings: PollSettings = {
  log_level: "info",
  on_error: "stop",
  batch_size: 10,
  poll_timeout: 10,
  max_empty_responses: undefined
}

const update = (id: number): Update => ({ update_id: id }) as Update

const okData = <T>(data: T) => ({ ok: true as const, data })
const errResult = (tag: string = "NotOkResponse") => ({
  ok: false as const,
  error: { _tag: tag } as { _tag: string }
})

const makeClient = (executeSafe: (...args: any[]) => Promise<any>): TgBotClient => ({
  config: {} as never,
  execute: (() => Promise.reject(new Error("not used"))) as TgBotClient["execute"],
  executeSafe: executeSafe as TgBotClient["executeSafe"],
  getFile: (() => Promise.reject(new Error("not used"))) as TgBotClient["getFile"],
  getFileSafe: (() => Promise.reject(new Error("not used"))) as TgBotClient["getFileSafe"]
})

describe("makePollSettings", () => {
  const warns: string[] = []
  const log = {
    ...silentLogger,
    warn: (msg: string) => warns.push(msg)
  }

  it("applies defaults for empty input", () => {
    const s = makePollSettings({}, silentLogger)
    expect(s).toMatchObject({
      log_level: "info",
      on_error: "stop",
      batch_size: 10,
      poll_timeout: 10,
      max_empty_responses: undefined
    })
  })

  it("clamps invalid batch_size to 10 and warns", () => {
    warns.length = 0
    const s = makePollSettings({ batch_size: 5 }, log)
    expect(s.batch_size).toBe(10)
    expect(warns.some((w) => w.includes("batch_size"))).toBe(true)

    warns.length = 0
    const s2 = makePollSettings({ batch_size: 1000 }, log)
    expect(s2.batch_size).toBe(10)
    expect(warns.some((w) => w.includes("batch_size"))).toBe(true)
  })

  it("clamps invalid poll_timeout to 20 and warns", () => {
    warns.length = 0
    const s = makePollSettings({ poll_timeout: 1 }, log)
    expect(s.poll_timeout).toBe(20)
    expect(warns.some((w) => w.includes("poll_timeout"))).toBe(true)

    warns.length = 0
    const s2 = makePollSettings({ poll_timeout: 200 }, log)
    expect(s2.poll_timeout).toBe(20)
  })

  it("ignores invalid max_empty_responses (< 2) and warns", () => {
    warns.length = 0
    const s = makePollSettings({ max_empty_responses: 1 }, log)
    expect(s.max_empty_responses).toBeUndefined()
    expect(warns.some((w) => w.includes("max_empty_responses"))).toBe(true)
  })

  it("preserves valid values without warnings", () => {
    warns.length = 0
    const s = makePollSettings({ batch_size: 50, poll_timeout: 30, max_empty_responses: 5 }, log)
    expect(s).toMatchObject({
      batch_size: 50,
      poll_timeout: 30,
      max_empty_responses: 5
    })
    expect(warns).toEqual([])
  })
})

describe("UpdateFetcher.fetchUpdates", () => {
  it("calls get_updates with the timeout, no offset on first poll", async () => {
    const execute = vi.fn().mockResolvedValueOnce(okData([]))
    const fetcher = new UpdateFetcher(makeClient(execute), baseSettings)

    await fetcher.fetchUpdates()

    expect(execute).toHaveBeenCalledTimes(1)
    expect(execute.mock.calls[0]).toEqual(["get_updates", { timeout: 10 }, { timeout: 20_000 }])
  })

  it("advances offset to last_id+1 on the next call", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce(okData([update(100), update(101), update(102)]))
      .mockResolvedValueOnce(okData([update(103)]))

    const fetcher = new UpdateFetcher(makeClient(execute), baseSettings)

    await fetcher.fetchUpdates()
    await fetcher.fetchUpdates()

    expect(execute.mock.calls[1]).toEqual([
      "get_updates",
      { timeout: 10, offset: 103 },
      { timeout: 20_000 }
    ])
  })

  it("sorts incoming updates by update_id", async () => {
    const execute = vi.fn().mockResolvedValueOnce(okData([update(102), update(100), update(101)]))

    const fetcher = new UpdateFetcher(makeClient(execute), baseSettings)
    const updates = await fetcher.fetchUpdates()

    expect(updates.map((u) => u.update_id)).toEqual([100, 101, 102])
  })

  it("does not advance offset on empty responses but increments empty counter", async () => {
    const execute = vi.fn().mockResolvedValueOnce(okData([])).mockResolvedValueOnce(okData([]))

    const fetcher = new UpdateFetcher(makeClient(execute), baseSettings)

    await fetcher.fetchUpdates()
    await fetcher.fetchUpdates()

    // Both calls have no offset (none was set yet)
    expect(execute.mock.calls[0][1]).toEqual({ timeout: 10 })
    expect(execute.mock.calls[1][1]).toEqual({ timeout: 10 })
  })

  it("resets empty-response counter after a non-empty batch", async () => {
    const execute = vi
      .fn()
      // 2 empty polls
      .mockResolvedValueOnce(okData([]))
      .mockResolvedValueOnce(okData([]))
      // non-empty
      .mockResolvedValueOnce(okData([update(50)]))
      // another 2 empty polls — should not throw because counter reset
      .mockResolvedValueOnce(okData([]))
      .mockResolvedValueOnce(okData([]))

    const fetcher = new UpdateFetcher(makeClient(execute), {
      ...baseSettings,
      max_empty_responses: 3
    })

    await fetcher.fetchUpdates()
    await fetcher.fetchUpdates()
    await fetcher.fetchUpdates()
    await fetcher.fetchUpdates()
    await expect(fetcher.fetchUpdates()).resolves.toBeDefined()
  })

  it("throws TooManyEmptyResponses when threshold is reached", async () => {
    const execute = vi.fn().mockResolvedValueOnce(okData([])).mockResolvedValueOnce(okData([]))

    const fetcher = new UpdateFetcher(makeClient(execute), {
      ...baseSettings,
      max_empty_responses: 2
    })

    await fetcher.fetchUpdates()
    await fetcher.fetchUpdates()
    await expect(fetcher.fetchUpdates()).rejects.toThrow("TooManyEmptyResponses")
  })

  it("throws when get_updates fails, surfacing the error tag", async () => {
    const execute = vi.fn().mockResolvedValueOnce(errResult("NotOkResponse"))
    const fetcher = new UpdateFetcher(makeClient(execute), baseSettings)

    await expect(fetcher.fetchUpdates()).rejects.toThrow(/Failed to fetch updates: NotOkResponse/)
  })
})

describe("UpdateFetcher.commit", () => {
  it("does nothing if no updates have been fetched yet", async () => {
    const execute = vi.fn()
    const fetcher = new UpdateFetcher(makeClient(execute), baseSettings)

    await fetcher.commit()

    expect(execute).not.toHaveBeenCalled()
  })

  it("commits the next-offset to telegram", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce(okData([update(7), update(8)]))
      .mockResolvedValueOnce(okData([]))

    const fetcher = new UpdateFetcher(makeClient(execute), baseSettings)

    await fetcher.fetchUpdates()
    await fetcher.commit()

    expect(execute.mock.calls[1]).toEqual(["get_updates", { offset: 9 }])
  })

  it("throws when commit fails", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce(okData([update(1)]))
      .mockResolvedValueOnce(errResult("NotOkResponse"))

    const fetcher = new UpdateFetcher(makeClient(execute), baseSettings)

    await fetcher.fetchUpdates()
    await expect(fetcher.commit()).rejects.toThrow(/Failed to commit offset: NotOkResponse/)
  })
})
