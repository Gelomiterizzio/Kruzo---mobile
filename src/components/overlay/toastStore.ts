import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration: number
}

interface ToastState {
  toasts: ToastItem[]
  show: (toast: Omit<ToastItem, 'id'>) => string
  dismiss: (id: string) => void
}

// Headless toast queue. UI is rendered by <ToastHost>; the imperative `toast`
// API (toast.ts) drives this store so any layer can show feedback without
// importing UI.
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    return id
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
