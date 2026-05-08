import { assert } from "vitest"

type Either<L, R> = { _tag: "Right"; right: R } | { _tag: "Left"; left: L }

/**
 * Assert an Either is Right and return its value. On failure, the assertion
 * message includes the Left payload — much cleaner than the
 * `if (e._tag === "Left") console.log(e.left); assert(...)` pattern that
 * pollutes test output.
 */
export const expectRight = <L, R>(e: Either<L, R>, ctx: string): R => {
  if (e._tag !== "Right") {
    assert.fail(`${ctx}: expected Right, got Left = ${JSON.stringify(e.left)}`)
  }
  return e.right
}
