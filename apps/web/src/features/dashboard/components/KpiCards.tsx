import { Cpu, BellRing, Radio, ShieldCheck } from 'lucide-react'
import { useApi } from '@/lib/hooks'
import { LoadingSpinner, ErrorState } from '@/components/shared/StatusStates'

interface Summary {
  total_devices: number
  active_devices: number
  inactive_devices: number
  total_alerts: number
  active_alerts: number
  critical_alerts: number
}

export function KpiCards() {
  const { data, isLoading, error, refetch } = useApi<Summary>('/dashboard/summary')

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!data) return null

  const uptime = data.total_devices > 0
    ? Math.round((data.active_devices / data.total_devices) * 100)
    : 0

  const kpis = [
    {
      label: 'Dispositivos Online',
      icon: Cpu,
      iconVariant: 'accent' as const,
      value: data.active_devices.toLocaleString('pt-BR'),
      footer: `de ${data.total_devices.toLocaleString('pt-BR')} total`,
      barWidth: data.total_devices > 0 ? `${(data.active_devices / data.total_devices) * 100}%` : '0%',
      barColor: 'var(--accent)',
    },
    {
      label: 'Alarmes Ativos',
      icon: BellRing,
      iconVariant: 'danger' as const,
      value: data.active_alerts.toLocaleString('pt-BR'),
      footer: `${data.critical_alerts} criticos`,
      barWidth: data.total_alerts > 0 ? `${(data.active_alerts / Math.max(data.total_alerts, 1)) * 100}%` : '0%',
      barColor: 'var(--danger)',
    },
    {
      label: 'Total Dispositivos',
      icon: Radio,
      iconVariant: 'info' as const,
      value: data.total_devices.toLocaleString('pt-BR'),
      footer: `${data.inactive_devices} inativos`,
      barWidth: `${(data.active_devices / Math.max(data.total_devices, 1)) * 100}%`,
      barColor: 'var(--info)',
    },
    {
      label: 'Uptime Geral',
      icon: ShieldCheck,
      iconVariant: 'success' as const,
      value: `${uptime}%`,
      footer: 'dispositivos ativos',
      barWidth: `${uptime}%`,
      barColor: 'var(--success)',
    },
  ]

  return (
    <div className="kpi-grid">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">{kpi.label}</span>
            <div className={`kpi-card-icon ${kpi.iconVariant}`}>
              <kpi.icon />
            </div>
          </div>
          <div className="kpi-card-value">{kpi.value}</div>
          <div className="kpi-card-footer">
            <span className="kpi-card-trend">{kpi.footer}</span>
          </div>
          <div className="kpi-card-bar">
            <div className="kpi-card-bar-fill" style={{ width: kpi.barWidth, background: kpi.barColor }} />
          </div>
        </div>
      ))}
    </div>
  )
}
