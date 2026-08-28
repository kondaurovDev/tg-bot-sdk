/**
 * Toast notifications slice of the playground component.
 */
export interface ToastEntry {
  id: number
  text: string
  type: "success" | "error"
  exiting: boolean
}

let toastCounter = 0

export const toastsState = () => ({
  toasts: [] as ToastEntry[]
})

export const toastsMethods = {
  _showToast(this: any, text: string, type: "success" | "error") {
    const id = toastCounter++
    this.toasts.push({ id, text, type, exiting: false })
    setTimeout(() => {
      const toast = this.toasts.find((t: ToastEntry) => t.id === id)
      if (toast) toast.exiting = true
      setTimeout(() => {
        this.toasts = this.toasts.filter((t: ToastEntry) => t.id !== id)
      }, 200)
    }, 2500)
  }
}
