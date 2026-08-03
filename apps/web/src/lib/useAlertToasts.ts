import { useEffect, useRef } from 'react'
import { useLiveAlerts } from '@/lib/liveAlerts'
import { pushToast } from '@/lib/toastStore'

const SEV_LABEL: Record<string, string> = {
  critical: 'Crítico',
  error: 'Erro',
  warning: 'Alto',
  info: 'Info',
  low: 'Baixo',
}

export function useAlertToasts() {
  const alerts = useLiveAlerts()
  const seen = useRef<Set<number>>(new Set())

  useEffect(() => {
    alerts.forEach((a) => {
      if (seen.current.has(a.id)) return
      seen.current.add(a.id)
      if (a.acknowledged) return
      const label = SEV_LABEL[a.level] ?? a.level
      pushToast(
        `Alarme ${label}: DEV-${String(a.device_id).padStart(3, '0')}`,
        a.alarm_type,
        a.level,
      )
    })
  }, [alerts])
}
