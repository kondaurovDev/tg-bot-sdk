/**
 * @module signature
 *
 * Mini Apps document methods as a table row whose name cell is the call
 * signature — `requestChat(req_id[, callback])` — and whose type cell is just
 * "Function". The signature is the only place the parameters are written, so
 * it is parsed rather than thrown away: it gives every method a parameter
 * list by default, and lets the tests check hand-written overrides against
 * the docs.
 */

export interface DocParam {
  readonly name: string
  readonly optional: boolean
}

export interface DocSignature {
  readonly name: string
  readonly params: readonly DocParam[]
}

/**
 * `requestChat(req_id[, callback])` → `{ name: "requestChat", params: [req_id, callback?] }`.
 * A parameter inside brackets is optional. The docs nest brackets
 * (`setEmojiStatus(custom_emoji_id[, params, callback])`) and also write
 * `updateBiometricToken(token, [callback])`; both read the same way.
 */
export const parseDocSignature = (raw: string): DocSignature | undefined => {
  const match = /^(\w+)\((.*)\)$/.exec(raw.trim())
  if (!match?.[1] || match[2] === undefined) return undefined
  const params: DocParam[] = []
  let depth = 0
  for (const [token] of match[2].matchAll(/\[|\]|\w+/g)) {
    if (token === "[") depth++
    else if (token === "]") depth--
    else params.push({ name: token, optional: depth > 0 })
  }
  return { name: match[1], params }
}

/**
 * The type a documented method gets until an override gives the real one:
 * the documented parameters, typed as loosely as is still safe to call.
 * A `callback` accepts any function; anything else accepts any value.
 */
export const renderDefaultSignature = (signature: DocSignature, returnType: string): string => {
  const params = signature.params.map(
    (p) =>
      `${p.name}${p.optional ? "?" : ""}: ${p.name === "callback" ? "(...args: never[]) => void" : "unknown"}`
  )
  return `(${params.join(", ")}) => ${returnType}`
}
