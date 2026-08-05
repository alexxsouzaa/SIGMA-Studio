import { useSyncExternalStore } from 'react'

export interface LiveAlert {
  id: number
  device_id: number
  alarm_type: string
  level: string
  value: number | null
  threshold: number | null
  acknowledged: boolean
  created_at: string
}

type Listener = () => void

let ws: WebSocket | null = null
let alerts: LiveAlert[] = []
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((l) => l())
}

function connect() {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const url = `${proto}//${window.location.host}${import.meta.env.BASE_URL}api/v1/ws/alerts`
  ws = new WebSocket(url)
  ws.onopen = () => emit()
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data)
      if (msg.type !== 'alert') return
      alerts = [msg.data as LiveAlert, ...alerts.filter((a) => a.id !== msg.data.id)]
      emit()
    } catch { /* ignore malformed frames */ }
  }
  ws.onclose = (ev) => {
    ws = null
    if (ev.code === 4401) return
    setTimeout(connect, 4000)
  }
  ws.onerror = () => ws?.close()
}

export function ensureAlertSocket() {
  if (!ws) connect()
}

export function subscribeAlerts(listener: Listener) {
  ensureAlertSocket()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useLiveAlerts() {
  return useSyncExternalStore(subscribeAlerts, () => alerts)
}
