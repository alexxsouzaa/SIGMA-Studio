import { useState } from 'react'
import { BellRing, Download, AlertTriangle, Info, ShieldAlert } from 'lucide-react'
import { EmptyState } from '@/lib/hooks'

// TODO: connect to GET /api/v1/alerts when endpoint exists

const FILTERS = [
  { label: 'Todos', value: 'all', count: 0, color: 'var(--fg-secondary)' },
  { label: 'Crítico', value: 'critical', count: 0, color: 'var(--danger)' },
  { label: 'Alerta', value: 'warning', count: 0, color: 'var(--warning)' },
  { label: 'Info', value: 'info', count: 0, color: 'var(--info)' },
]

export default function AlarmsPage() {
  const [filter, setFilter] = useState('all')

  const stats = [
    { label: 'Total', value: 0, icon: BellRing, className: 'accent' },
    { label: 'Críticos', value: 0, icon: ShieldAlert, className: 'danger' },
    { label: 'Alertas', value: 0, icon: AlertTriangle, className: 'warning' },
    { label: 'Informativos', value: 0, icon: Info, className: 'info' },
  ]

  return (
    <>
      <div className="kpi-grid">
        {stats.map((s) => (
          <div className="kpi-card" key={s.label}>
            <div className="kpi-card-header">
              <span className="kpi-card-label">{s.label}</span>
              <div className={`kpi-card-icon ${s.className}`}><s.icon /></div>
            </div>
            <div className="kpi-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="widget">
        <div className="widget-header">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={`filter-chip${filter === f.value ? ' active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {filter === f.value && <span className="filter-chip-dot" style={{ background: f.color }} />}
                {f.label}
                <span className="filter-chip-count">{f.count}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto' }}>
              <Download /> Exportar
            </button>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)' }}>
              Silenciar todos
            </button>
          </div>
        </div>
        <div className="widget-body" style={{ padding: 0 }}>
          <EmptyState icon={<BellRing />} title="Nenhum alarme encontrado" />
        </div>
      </div>
    </>
  )
}
