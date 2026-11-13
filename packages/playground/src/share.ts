/**
 * @module share
 * Links into the playground: `?example=rich` opens an example, and
 * `#code=…` carries code — deflated and base64url-encoded, so a bot of a
 * few hundred lines still fits in a URL.
 */

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "")
}

const fromBase64Url = (text: string): Uint8Array<ArrayBuffer> => {
  const binary = atob(text.replaceAll("-", "+").replaceAll("_", "/"))
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

const pipe = async (
  bytes: Uint8Array<ArrayBuffer>,
  through: CompressionStream | DecompressionStream
) =>
  new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(through)).arrayBuffer())

export const encodeCode = async (code: string): Promise<string> =>
  toBase64Url(await pipe(new TextEncoder().encode(code), new CompressionStream("deflate-raw")))

/** The code in a link; `null` when the text is not one this module wrote. */
export const decodeCode = async (encoded: string): Promise<string | null> => {
  try {
    return new TextDecoder().decode(
      await pipe(fromBase64Url(encoded), new DecompressionStream("deflate-raw"))
    )
  } catch {
    return null
  }
}

export interface ShareLink {
  /** The example's file name, from `?example=rich` or `?example=rich.ts`. */
  example?: string
  /** The encoded code from `#code=…`, not yet decoded. */
  code?: string
}

export const readShareLink = (url: URL): ShareLink => {
  const example = url.searchParams.get("example")
  const code = new URLSearchParams(url.hash.slice(1)).get("code")
  return {
    ...(example ? { example: example.endsWith(".ts") ? example : `${example}.ts` } : {}),
    ...(code ? { code } : {})
  }
}

/** A link to an example (`?example=`), with the code when it differs from the example's. */
export const shareLink = (base: URL, example: string, encodedCode: string | null): string => {
  const url = new URL(base.pathname, base.origin)
  url.searchParams.set("example", example.replace(/\.ts$/, ""))
  if (encodedCode !== null) url.hash = `code=${encodedCode}`
  return url.toString()
}
