import { useState, useEffect, useCallback } from 'react'
import { usePreferences } from '@/lib/hooks'

export const WIDGET_DEFS = [
  { key: 'kpis', label: 'KPIs', icon: 'bar-chart-3' },
  { key: 'telemetry', label: 'Telemetria', icon: 'activity' },
  { key: 'devices', label: 'Status dos Dispositivos', icon: 'cpu' },
  { key: 'alarms', label: 'Alarmes Recentes', icon: 'bell-ring' },
  { key: 'gateways', label: 'Gateways', icon: 'router' },
  { key: 'protocols', label: 'Distribuição de Protocolos', icon: 'radio' },
  { key: 'ai', label: 'Insights de IA', icon: 'brain' },
] as const

export type WidgetKey = (typeof WIDGET_DEFS)[number]['key']

const ALL_KEYS = WIDGET_DEFS.map((w) => w.key)

export function useDashboardWidgets() {
  const { preferences, save } = usePreferences()
  const [widgets, setWidgets] = useState<WidgetKey[]>(ALL_KEYS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded) return
    const saved = (preferences.dashboardWidgets as WidgetKey[] | undefined)
    if (Array.isArray(saved) && saved.length > 0) {
      setWidgets(saved.filter((k) => (ALL_KEYS as string[]).includes(k)))
    }
    setLoaded(true)
  }, [preferences, loaded])

  const toggleWidget = useCallback((key: WidgetKey) => {
    setWidgets((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      save({ ...preferences, dashboardWidgets: next })
      return next
    })
  }, [save, preferences])

  const resetWidgets = useCallback(() => {
    setWidgets(ALL_KEYS)
    save({ ...preferences, dashboardWidgets: ALL_KEYS })
  }, [save, preferences])

  return { widgets, toggleWidget, resetWidgets, isVisible: (k: WidgetKey) => widgets.includes(k) }
}
