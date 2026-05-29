export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  function add(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).slice(2)
    toasts.value.push({ id, duration: 4000, ...toast })
    if (toast.duration !== 0) {
      setTimeout(() => remove(id), toast.duration ?? 4000)
    }
    return id
  }

  function remove(id: string) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx >= 0) toasts.value.splice(idx, 1)
  }

  const success = (title: string, message?: string) => add({ type: 'success', title, message })
  const error   = (title: string, message?: string) => add({ type: 'error',   title, message, duration: 6000 })
  const warning = (title: string, message?: string) => add({ type: 'warning', title, message })
  const info    = (title: string, message?: string) => add({ type: 'info',    title, message })

  return { toasts: readonly(toasts), add, remove, success, error, warning, info }
}
