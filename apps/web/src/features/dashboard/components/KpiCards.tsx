import { Cpu, BellRing, Radio, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react'
import { useApi } from '@/lib/hooks'
import { ErrorState } from '@/components/shared/StatusStates'

interface Summary {
  total_devices: number; active_devices: number; inactive_devices: number
  total_alerts: number; active_alerts: number; critical_alerts: number
}

export function KpiCards() {
  const { data, isLoading, error, refetch } = useApi<Summary>('/dashboard/summary', { refreshInterval: 30000 })
  if (isLoading) return <div className="kpi-grid">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="kpi-card"><div className="skeleton" style={{ height: 60 }} /></div>)}</div>
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!data) return null

  const uptime = data.total_devices > 0 ? Math.round((data.active_devices / data.total_devices) * 100) : 0
  const inactiveCount = data.total_devices - data.active_devices

  return (
    <div className="kpi-grid">
      {[
        { label: 'Dispositivos Online', value: data.active_devices.toLocaleString('pt-BR'), icon: Cpu, iconClass: 'accent', trend: 'up', trendLabel: `+${data.active_devices - inactiveCount}`, footer: `de ${data.total_devices} total`, barPct: uptime, barColor: 'var(--accent)' },
        { label: 'Alarmes Ativos', value: data.active_alerts.toLocaleString('pt-BR'), icon: BellRing, iconClass: 'danger', trend: 'down', trendLabel: `-${data.active_alerts}`, footer: `${data.critical_alerts} críticos, ${data.active_alerts - data.critical_alerts} altos`, barPct: data.total_alerts > 0 ? (data.active_alerts / data.total_alerts) * 100 : 0, barColor: 'var(--danger)' },
        { label: 'Mensagens/min', value: '48.2K', icon: Radio, iconClass: 'info', trend: 'up', trendLabel: '+3.1%', footer: 'MQTT + OPC-UA', barPct: 72, barColor: 'var(--info)' },
        { label: 'Uptime Geral', value: `${uptime}%`, icon: ShieldCheck, iconClass: 'success', trend: 'up', trendLabel: `+${uptime}%`, footer: 'últimos 30 dias', barPct: uptime, barColor: 'var(--success)' },
      ].map((card) => {
        const Icon = card.icon
        const TrendIcon = card.trend === 'up' ? TrendingUp : TrendingDown
        return (
          <div key={card.label} className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-label">{card.label}</span>
              <div className={`kpi-card-icon ${card.iconClass}`}><Icon /></div>
            </div>
            <div className="kpi-card-value">{card.value}</div>
            <div className="kpi-card-footer">
              <span className={`kpi-card-trend ${card.trend}`}><TrendIcon />{card.trendLabel}</span>
              <span>{card.footer}</span>
            </div>
            <div className="kpi-card-bar">
              <div className="kpi-card-bar-fill" style={{ width: `${card.barPct}%`, background: card.barColor }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
