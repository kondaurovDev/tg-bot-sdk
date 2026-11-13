/**
 * `<tg-api-runner method="getMe" fields='[…]'>`: the API reference's "try it"
 * widget. The codegen writes only the tag with the method and its fields
 * (packages/api/codegen/service/markdown.ts); this element renders the form,
 * calls the method with the visitor's token and shows the reply. The token
 * is shared with the playground's real mode (same localStorage key).
 */

const TOKEN_KEY = "playground_bot_token"
const CHAT_ID_KEY = "playground_chat_id"

type FieldType = "string" | "number" | "boolean" | "json"

interface Field {
  name: string
  type: FieldType
  required: boolean
}

const isFieldType = (value: unknown): value is FieldType =>
  value === "string" || value === "number" || value === "boolean" || value === "json"

const parseFields = (raw: string | null): Field[] => {
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]")
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((item: unknown) => {
      if (typeof item !== "object" || item === null) return []
      const name: unknown = Reflect.get(item, "name")
      const type: unknown = Reflect.get(item, "type")
      return typeof name === "string" && isFieldType(type)
        ? [{ name, type, required: Reflect.get(item, "required") === true }]
        : []
    })
  } catch {
    return []
  }
}

const storage = {
  get: (key: string) => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set: (key: string, value: string | null) => {
    try {
      if (value === null) localStorage.removeItem(key)
      else localStorage.setItem(key, value)
    } catch {
      // A convenience only: the widget works without storage
    }
  }
}

/** A small element factory: tag, attributes, children. */
const h = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] => {
  const el = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
  el.append(...children)
  return el
}

const button = (label: string, className: string, onClick: () => void) => {
  const el = h("button", { type: "button", class: className }, label)
  el.addEventListener("click", onClick)
  return el
}

class ApiRunner extends HTMLElement {
  private method = ""
  private fields: Field[] = []
  private token = ""
  private inputs = new Map<string, HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>()
  private els!: {
    bar: HTMLElement
    tokenRow: HTMLElement
    actions: HTMLElement
    run: HTMLButtonElement
    response: HTMLElement
    responseTitle: HTMLElement
    responseBody: HTMLPreElement
    collapse: HTMLButtonElement
    detect?: HTMLButtonElement
  }

  connectedCallback() {
    if (this.els) return
    this.method = this.getAttribute("method") ?? ""
    this.fields = parseFields(this.getAttribute("fields"))
    this.token = storage.get(TOKEN_KEY) ?? ""
    this.render()
    this.sync()
  }

  private render() {
    const tokenInput = h("input", {
      type: "text",
      class: "tgr-input",
      placeholder: "Paste token from @BotFather",
      autocomplete: "off",
      spellcheck: "false"
    })
    const saveToken = () => {
      const token = tokenInput.value.trim()
      if (!token) return
      storage.set(TOKEN_KEY, token)
      this.token = token
      this.sync()
    }
    tokenInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") saveToken()
    })

    const bar = h(
      "div",
      { class: "tgr-bar" },
      h(
        "span",
        {},
        "Token saved",
        button("Change", "tgr-link", () => {
          storage.set(TOKEN_KEY, null)
          this.token = ""
          tokenInput.value = ""
          this.sync()
        })
      )
    )
    const tokenRow = h(
      "div",
      { class: "tgr-field" },
      h("label", { class: "tgr-label" }, "Bot Token"),
      h("div", { class: "tgr-row" }, tokenInput, button("Save", "tgr-primary", saveToken))
    )

    const required = this.fields.filter((f) => f.required)
    const optional = this.fields.filter((f) => !f.required)
    const body = h("div", { class: "tgr-body" }, tokenRow, ...required.map((f) => this.field(f)))

    if (optional.length > 0) {
      const group = h(
        "div",
        { class: "tgr-optional", hidden: "" },
        ...optional.map((f) => this.field(f))
      )
      const toggle = button(`Show optional (${optional.length})`, "tgr-link tgr-toggle", () => {
        group.hidden = !group.hidden
        toggle.textContent = `${group.hidden ? "Show" : "Hide"} optional (${optional.length})`
      })
      body.append(toggle, group)
    }

    const run = button("Run", "tgr-primary", () => void this.run())
    const actions = h("div", { class: "tgr-actions" }, run)
    if (this.fields.length > 0) actions.append(button("Reset", "tgr-secondary", () => this.reset()))

    const responseTitle = h("span", { class: "tgr-response-title" }, "Response")
    const responseBody = h("pre", { class: "tgr-response-body" })
    const collapse = button("Collapse", "tgr-link tgr-small", () => {
      responseBody.hidden = !responseBody.hidden
      collapse.textContent = responseBody.hidden ? "Expand" : "Collapse"
    })
    const response = h(
      "div",
      { class: "tgr-response", hidden: "" },
      h("div", { class: "tgr-response-head" }, responseTitle, collapse),
      responseBody
    )
    body.append(actions, response)

    this.els = {
      ...this.els,
      bar,
      tokenRow,
      actions,
      run,
      response,
      responseTitle,
      responseBody,
      collapse
    }
    this.replaceChildren(h("div", { class: "tgr" }, bar, body))
  }

  private field(field: Field): HTMLElement {
    const label = h("label", { class: "tgr-label" }, field.name)
    let input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    if (field.type === "boolean") {
      input = h(
        "select",
        { class: "tgr-input" },
        h("option", { value: "" }, "—"),
        h("option", { value: "true" }, "true"),
        h("option", { value: "false" }, "false")
      )
    } else if (field.type === "json") {
      input = h("textarea", { class: "tgr-input", placeholder: "{}", rows: "2" })
    } else {
      input = h("input", {
        class: "tgr-input",
        type: field.type === "number" ? "number" : "text",
        placeholder: field.name
      })
    }
    this.inputs.set(field.name, input)

    if (field.name !== "chat_id") return h("div", { class: "tgr-field" }, label, input)

    // chat_id: remembered across pages, and found from the bot's last update
    input.value = storage.get(CHAT_ID_KEY) ?? ""
    const detect = button("Detect", "tgr-secondary tgr-small", () => void this.detectChatId())
    this.els = { ...this.els, detect }
    return h("div", { class: "tgr-field" }, label, h("div", { class: "tgr-row" }, input, detect))
  }

  /** Show what fits whether a token is saved. */
  private sync() {
    const hasToken = this.token !== ""
    this.els.bar.hidden = !hasToken
    this.els.tokenRow.hidden = hasToken
    this.els.actions.hidden = !hasToken
    if (this.els.detect) this.els.detect.disabled = !hasToken
  }

  private show(text: string, ok: boolean) {
    const { response, responseTitle, responseBody, collapse } = this.els
    response.hidden = false
    response.classList.toggle("tgr-failed", !ok)
    responseTitle.textContent = "Response"
    responseBody.hidden = false
    responseBody.textContent = text
    collapse.textContent = "Collapse"
  }

  private params(): Record<string, unknown> | string {
    const params: Record<string, unknown> = {}
    for (const field of this.fields) {
      const raw = this.inputs.get(field.name)?.value ?? ""
      if (raw === "") continue
      if (field.type === "number") {
        const n = Number(raw)
        if (Number.isNaN(n)) return `"${field.name}" must be a number`
        params[field.name] = n
      } else if (field.type === "boolean") {
        params[field.name] = raw === "true"
      } else if (field.type === "json") {
        try {
          params[field.name] = JSON.parse(raw)
        } catch {
          return `"${field.name}" must be valid JSON`
        }
      } else {
        params[field.name] = raw
      }
    }
    return params
  }

  private async run() {
    if (!this.token) return
    const params = this.params()
    if (typeof params === "string") {
      this.show(params, false)
      return
    }
    if (params["chat_id"] != null) storage.set(CHAT_ID_KEY, String(params["chat_id"]))

    const { run } = this.els
    run.disabled = true
    run.textContent = "Running..."
    try {
      const res = await fetch(`https://api.telegram.org/bot${this.token}/${this.method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      })
      const json: unknown = await res.json()
      const ok = typeof json === "object" && json !== null && "ok" in json && json.ok === true
      this.show(JSON.stringify(json, null, 2), ok)
    } catch (error) {
      this.show(error instanceof Error ? error.message : "Request failed", false)
    } finally {
      run.disabled = false
      run.textContent = "Run"
    }
  }

  private reset() {
    for (const input of this.inputs.values()) input.value = ""
    this.els.response.hidden = true
  }

  private async detectChatId() {
    const { detect } = this.els
    if (!this.token || !detect) return
    detect.disabled = true
    detect.textContent = "..."
    try {
      const res = await fetch(`https://api.telegram.org/bot${this.token}/getUpdates`)
      const json: unknown = await res.json()
      const updates =
        typeof json === "object" && json !== null && "result" in json ? json.result : undefined
      const last: unknown = Array.isArray(updates) ? updates.at(-1) : undefined
      const chatId = findChatId(last)
      if (chatId === undefined) {
        this.show(
          last === undefined
            ? "No messages found. Send any message to your bot first, then click Detect again."
            : "Could not extract chat_id from recent updates.",
          false
        )
        return
      }
      storage.set(CHAT_ID_KEY, chatId)
      const input = this.inputs.get("chat_id")
      if (input) input.value = chatId
    } catch {
      this.show("Failed to call getUpdates.", false)
    } finally {
      detect.disabled = false
      detect.textContent = "Detect"
    }
  }
}

/** The chat id of an update: a message, a callback query's message, a channel post. */
const findChatId = (update: unknown): string | undefined => {
  const pick = (value: unknown, ...path: string[]): unknown =>
    path.reduce<unknown>(
      (node, key) =>
        typeof node === "object" && node !== null ? Reflect.get(node, key) : undefined,
      value
    )
  const id =
    pick(update, "message", "chat", "id") ??
    pick(update, "callback_query", "message", "chat", "id") ??
    pick(update, "channel_post", "chat", "id")
  return typeof id === "number" || typeof id === "string" ? String(id) : undefined
}

if (!customElements.get("tg-api-runner")) customElements.define("tg-api-runner", ApiRunner)
