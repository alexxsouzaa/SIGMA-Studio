import { useSyncExternalStore } from 'react'

export interface ToastItem {
  id: number
  title: string
  description?: string
  level: string
}

let toasts: ToastItem[] = []
let nextId = 1
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

export function pushToast(title: string, description?: string, level = 'info') {
  const item: ToastItem = { id: nextId++, title, description, level }
  toasts = [...toasts, item].slice(-4)
  emit()
  setTimeout(() => dismiss(item.id), 6000)
}

export function subscribeToasts(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useToasts() {
  return useSyncExternalStore(subscribeToasts, () => toasts)
}

export { dismiss as dismissToast }
