import { Cpu, BellRing, Radio, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react'

const kpis = [
  {
    label: 'Dispositivos Online',
    value: '1.247',
    icon: Cpu,
    iconVariant: 'accent' as const,
    trend: { direction: 'up' as const, text: '+12' },
    footer: 'de 1.340 total',
    barWidth: '93%',
    barColor: 'var(--accent)',
  },
  {
    label: 'Alarmes Ativos',
    value: '23',
    icon: BellRing,
    iconVariant: 'danger' as const,
    trend: { direction: 'down' as const, text: '-5' },
    footer: '3 críticos, 8 altos',
    barWidth: '15%',
    barColor: 'var(--danger)',
  },
  {
    label: 'Mensagens/min',
    value: '48.2K',
    icon: Radio,
    iconVariant: 'info' as const,
    trend: { direction: 'up' as const, text: '+3.1%' },
    footer: 'MQTT + OPC-UA',
    barWidth: '72%',
    barColor: 'var(--info)',
  },
  {
    label: 'Uptime Geral',
    value: '99,97%',
    icon: ShieldCheck,
    iconVariant: 'success' as const,
    trend: { direction: 'up' as const, text: '+0,02%' },
    footer: 'últimos 30 dias',
    barWidth: '99.97%',
    barColor: 'var(--success)',
  },
]

export function KpiCards() {
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
            <span className={`kpi-card-trend ${kpi.trend.direction}`}>
              {kpi.trend.direction === 'up' ? <TrendingUp /> : <TrendingDown />}
              {kpi.trend.text}
            </span>
            <span>{kpi.footer}</span>
          </div>
          <div className="kpi-card-bar">
            <div
              className="kpi-card-bar-fill"
              style={{ width: kpi.barWidth, background: kpi.barColor }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
