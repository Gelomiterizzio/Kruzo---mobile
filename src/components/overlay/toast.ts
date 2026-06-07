import { useToastStore, type ToastType } from './toastStore'

function show(type: ToastType, message: string, duration = 3000): string {
  return useToastStore.getState().show({ type, message, duration })
}

// Imperative toast API — usable from anywhere (hooks, services, screens):
//   toast.success('Guardado en favoritos')
export const toast = {
  success: (message: string, duration?: number) => show('success', message, duration),
  error: (message: string, duration?: number) => show('error', message, duration),
  info: (message: string, duration?: number) => show('info', message, duration),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
}
