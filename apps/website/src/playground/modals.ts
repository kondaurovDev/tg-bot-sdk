/**
 * Modal dialogs slice of the playground component: bot token input
 * and webhook-deletion confirmation.
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
    description: "",
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

  _showConfirmModal(this: any, description: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmModal.description = description
      this.confirmModal._resolve = resolve
      this.confirmModal.open = true
    })
  }
}
