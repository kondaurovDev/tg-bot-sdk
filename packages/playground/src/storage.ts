/**
 * @module storage
 * What the playground remembers per visitor, in localStorage. The keys
 * are the ones the Alpine version used, so saved edits and tokens carry
 * over. Storage may be unavailable (private mode, blocked site data):
 * every access is guarded and falls back to nothing.
 */

const KEYS = {
  token: "playground_bot_token",
  mode: "playground_mode",
  example: "playground_active_example",
  code: (file: string) => `playground_code:${file}`
}

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const write = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Storage is a convenience: the playground works without it
  }
}

export const storage = {
  token: () => read(KEYS.token),
  setToken: (token: string | null) => write(KEYS.token, token),
  mode: (): "virtual" | "real" => (read(KEYS.mode) === "real" ? "real" : "virtual"),
  setMode: (mode: "virtual" | "real") => write(KEYS.mode, mode),
  example: () => read(KEYS.example),
  setExample: (file: string) => write(KEYS.example, file),
  /** The visitor's edits of an example, if any. */
  code: (file: string) => read(KEYS.code(file)),
  /** Edits equal to the shipped example are not stored: the visitor then gets its updates. */
  saveCode: (file: string, code: string, original: string) =>
    write(KEYS.code(file), code === original ? null : code)
}
