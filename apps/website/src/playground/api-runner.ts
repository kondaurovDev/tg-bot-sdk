import type { Alpine } from "alpinejs"

const TOKEN_KEY = "playground_bot_token"
const CHAT_ID_KEY = "playground_chat_id"

interface FieldConfig {
  name: string
  type: "string" | "number" | "boolean" | "json"
  required: boolean
}

interface ApiRunnerConfig {
  method: string
  fields: FieldConfig[]
}

export function registerApiRunner(Alpine: Alpine) {
  Alpine.data("apiRunner", (config: ApiRunnerConfig) => ({
    method: config.method,
    fieldDefs: config.fields,

    token: "",
    tokenInput: "",
    showTokenInput: true,

    values: {} as Record<string, string>,
    showOptional: false,

    loading: false,
    response: null as string | null,
    responseOk: null as boolean | null,
    error: null as string | null,
    showResponse: true,

    init() {
      const saved = localStorage.getItem(TOKEN_KEY)
      if (saved) {
        this.token = saved
        this.showTokenInput = false
      }
      const chatId = localStorage.getItem(CHAT_ID_KEY)
      if (chatId && this.fieldDefs.some((f: FieldConfig) => f.name === "chat_id")) {
        this.values.chat_id = chatId
      }
    },

    saveToken() {
      const t = this.tokenInput.trim()
      if (!t) return
      localStorage.setItem(TOKEN_KEY, t)
      this.token = t
      this.showTokenInput = false
    },

    clearToken() {
      localStorage.removeItem(TOKEN_KEY)
      this.token = ""
      this.tokenInput = ""
      this.showTokenInput = true
    },

    async run() {
      if (!this.token) return

      this.loading = true
      this.response = null
      this.responseOk = null
      this.error = null
      this.showResponse = true

      const params: Record<string, unknown> = {}

      for (const field of this.fieldDefs) {
        const raw = this.values[field.name]
        if (raw === undefined || raw === "") continue

        if (field.type === "number") {
          const n = Number(raw)
          if (Number.isNaN(n)) {
            this.error = `"${field.name}" must be a number`
            this.loading = false
            return
          }
          params[field.name] = n
        } else if (field.type === "boolean") {
          params[field.name] = raw === "true"
        } else if (field.type === "json") {
          try {
            params[field.name] = JSON.parse(raw)
          } catch {
            this.error = `"${field.name}" must be valid JSON`
            this.loading = false
            return
          }
        } else {
          params[field.name] = raw
        }
      }

      if (params.chat_id != null) {
        localStorage.setItem(CHAT_ID_KEY, String(params.chat_id))
      }

      try {
        const url = `https://api.telegram.org/bot${this.token}/${this.method}`
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params)
        })
        const json = await res.json()
        this.response = JSON.stringify(json, null, 2)
        this.responseOk = json.ok === true
      } catch (e) {
        this.error = e instanceof Error ? e.message : "Request failed"
      } finally {
        this.loading = false
      }
    },

    reset() {
      this.values = {}
      this.response = null
      this.responseOk = null
      this.error = null
    },

    detectingChatId: false,

    async detectChatId() {
      if (!this.token) return
      this.detectingChatId = true
      this.error = null
      try {
        const res = await fetch(`https://api.telegram.org/bot${this.token}/getUpdates`)
        const json = await res.json()
        const updates = json?.result
        if (!Array.isArray(updates) || updates.length === 0) {
          this.error =
            "No messages found. Send any message to your bot first, then click Detect again."
          return
        }
        const last = updates[updates.length - 1]
        const chatId =
          last?.message?.chat?.id ??
          last?.callback_query?.message?.chat?.id ??
          last?.channel_post?.chat?.id
        if (chatId) {
          const id = String(chatId)
          localStorage.setItem(CHAT_ID_KEY, id)
          this.values.chat_id = id
        } else {
          this.error = "Could not extract chat_id from recent updates."
        }
      } catch {
        this.error = "Failed to call getUpdates."
      } finally {
        this.detectingChatId = false
      }
    },

    get requiredFields(): FieldConfig[] {
      return this.fieldDefs.filter((f: FieldConfig) => f.required)
    },

    get optionalFields(): FieldConfig[] {
      return this.fieldDefs.filter((f: FieldConfig) => !f.required)
    }
  }))
}
