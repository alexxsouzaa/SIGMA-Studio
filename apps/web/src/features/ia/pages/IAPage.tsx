import { useState } from 'react'
import { Brain, Upload, Plus } from 'lucide-react'

// TODO: connect to GET /api/v1/models when endpoint exists
const ALL_MODELS: Array<{ id: string; name: string; status: string; type: string; framework: string; accuracy: number; latency: number; f1: number; device: string; size: string; date: string }> = []

const FILTERS = [
  { label: 'Todos', value: 'all', count: 0 },
  { label: 'Em produção', value: 'deployed', count: 0 },
  { label: 'Em treinamento', value: 'training', count: 0 },
  { label: 'Staging', value: 'staging', count: 0 },
  { label: 'Arquivados', value: 'archived', count: 0 },
]

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  deployed: { label: 'Em produção', className: 'success' },
  training: { label: 'Em treinamento', className: 'warning' },
  staging: { label: 'Staging', className: 'info' },
  archived: { label: 'Arquivado', className: '' },
}

export default function IAPage() {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? ALL_MODELS : ALL_MODELS.filter((m) => m.status === filter)

  const stats = [
    { label: 'Modelos totais', value: 0, className: 'info' },
    { label: 'Em produção', value: 0, className: 'success' },
    { label: 'Em treinamento', value: 0, className: 'warning' },
    { label: 'Inferências/dia', value: '---', className: 'accent' },
  ]

  return (
    <>
      <div className="kpi-grid">
        {stats.map((s) => (
          <div className="kpi-card" key={s.label}>
            <div className="kpi-card-header">
              <span className="kpi-card-label">{s.label}</span>
              <div className={`kpi-card-icon ${s.className}`}><Brain /></div>
            </div>
            <div className="kpi-card-value">{typeof s.value === 'number' ? s.value.toLocaleString('pt-BR') : s.value}</div>
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
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto' }}><Upload /> Importar</button>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto', background: 'var(--fg)', color: 'var(--bg)' }}><Plus /> Novo modelo</button>
          </div>
        </div>

        <div className="widget-body">
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: 48 }}>
              <Brain size={32} />
              <div className="empty-state-text">Nenhum modelo de IA cadastrado</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
              {filtered.map((m) => {
                const status = STATUS_MAP[m.status]
                return (
                  <div key={m.id} className="widget" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{m.name}</div>
                        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>{m.id}</div>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--radius-sm)',
                        background: m.status === 'deployed' ? 'var(--success-muted)' : m.status === 'training' ? 'var(--warning-muted)' : m.status === 'staging' ? 'var(--info-muted)' : 'var(--surface-hover)',
                        color: m.status === 'deployed' ? 'var(--success)' : m.status === 'training' ? 'var(--warning)' : m.status === 'staging' ? 'var(--info)' : 'var(--fg-muted)',
                      }}>
                        {status?.label ?? m.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 16, marginBottom: 14, fontSize: 12, color: 'var(--fg-secondary)' }}>
                      <span>{m.type}</span>
                      <span>{m.framework}</span>
                      <span>{m.size}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                      {[
                        { label: 'Acurácia', value: `${m.accuracy}%` },
                        { label: 'Latência', value: `${m.latency}ms` },
                        { label: 'F1 Score', value: m.f1.toFixed(2) },
                      ].map((metric) => (
                        <div key={metric.label} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em', color: 'var(--fg)' }}>{metric.value}</div>
                          <div style={{ fontSize: 10, color: 'var(--fg-muted)', marginTop: 1 }}>{metric.label}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>{m.device}</span>
                      <div className="alarm-actions">
                        <button className="alarm-action-btn"><Brain /></button>
                        <button className="alarm-action-btn"><Upload /></button>
                        <button className="alarm-action-btn"><Plus /></button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
