import { useState } from 'react'
import { Router, Plus, Radio } from 'lucide-react'
import { EmptyState } from '@/lib/hooks'

// TODO: connect to GET /api/v1/gateways when endpoint exists

const FILTERS = [
  { label: 'Todos', value: 'all', count: 0 },
  { label: 'Online', value: 'online', count: 0 },
  { label: 'Alerta', value: 'warning', count: 0 },
  { label: 'Offline', value: 'offline', count: 0 },
]

export default function GatewaysPage() {
  const [filter, setFilter] = useState('all')

  const stats = [
    { label: 'Gateways', value: 0, className: 'accent' },
    { label: 'Online', value: 0, className: 'success' },
    { label: 'Alerta', value: 0, className: 'warning' },
    { label: 'Offline', value: 0, className: 'danger' },
  ]

  return (
    <>
      <div className="kpi-grid">
        {stats.map((s) => (
          <div className="kpi-card" key={s.label}>
            <div className="kpi-card-header">
              <span className="kpi-card-label">{s.label}</span>
              <div className={`kpi-card-icon ${s.className}`}><Router /></div>
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
                {f.label}
                <span className="filter-chip-count">{f.count}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto' }}>
              <Radio /> Escanear
            </button>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto', background: 'var(--fg)', color: 'var(--bg)' }}>
              <Plus /> Adicionar Gateway
            </button>
          </div>
        </div>

        <div className="widget-body">
          <EmptyState icon={<Router />} title="Nenhum gateway configurado" />
        </div>
      </div>
    </>
  )
}
