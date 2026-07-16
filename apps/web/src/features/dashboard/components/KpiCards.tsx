import { Cpu, BellRing, Radio, ShieldCheck } from 'lucide-react'

// TODO: connect to GET /api/v1/dashboard/summary when endpoint exists

const skeletonKpis = [
  { label: 'Dispositivos Online', icon: Cpu, iconVariant: 'accent' as const, barWidth: '0%', barColor: 'var(--accent)' },
  { label: 'Alarmes Ativos', icon: BellRing, iconVariant: 'danger' as const, barWidth: '0%', barColor: 'var(--danger)' },
  { label: 'Mensagens/min', icon: Radio, iconVariant: 'info' as const, barWidth: '0%', barColor: 'var(--info)' },
  { label: 'Uptime Geral', icon: ShieldCheck, iconVariant: 'success' as const, barWidth: '0%', barColor: 'var(--success)' },
]

export function KpiCards() {
  return (
    <div className="kpi-grid">
      {skeletonKpis.map((kpi) => (
        <div key={kpi.label} className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">{kpi.label}</span>
            <div className={`kpi-card-icon ${kpi.iconVariant}`}>
              <kpi.icon />
            </div>
          </div>
          <div className="kpi-card-value">---</div>
          <div className="kpi-card-footer">
            <span className="kpi-card-trend down">
              Carregando...
            </span>
            <span></span>
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
