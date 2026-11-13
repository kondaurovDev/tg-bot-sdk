/**
 * Modal dialogs slice of the playground component: bot token input
 * and a confirmation dialog.
 */
export const modalsState = () => ({
  tokenModal: {
    open: false,
    value: "",
    error: "",
    _resolve: null as ((v: string | null) => void) | null
  },

  confirmModal: {
    open: false,
    title: "",
    description: "",
    confirmLabel: "",
    _resolve: null as ((v: boolean) => void) | null
  }
})

export const modalsMethods = {
  submitToken(this: any) {
    const val = this.tokenModal.value.trim()
    if (!val) {
      this.tokenModal.error = "Token is required"
      return
    }
    this.tokenModal.open = false
    this.tokenModal._resolve?.(val)
  },

  cancelToken(this: any) {
    this.tokenModal.open = false
    this.tokenModal._resolve?.(null)
  },

  _showTokenModal(this: any, initialValue: string): Promise<string | null> {
    return new Promise((resolve) => {
      this.tokenModal.value = initialValue
      this.tokenModal.error = ""
      this.tokenModal._resolve = resolve
      this.tokenModal.open = true
      this.$nextTick(() => {
        ;(this.$refs.tokenInput as HTMLInputElement | undefined)?.focus()
      })
    })
  },

  resolveConfirm(this: any, val: boolean) {
    this.confirmModal.open = false
    this.confirmModal._resolve?.(val)
  },

  _showConfirmModal(
    this: any,
    description: string,
    options: { title: string; confirmLabel: string }
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmModal.title = options.title
      this.confirmModal.confirmLabel = options.confirmLabel
      this.confirmModal.description = description
      this.confirmModal._resolve = resolve
      this.confirmModal.open = true
    })
  }
}
