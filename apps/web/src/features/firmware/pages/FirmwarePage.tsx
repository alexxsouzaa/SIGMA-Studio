import { useState } from 'react'
import { HardDrive, Upload, RefreshCw } from 'lucide-react'

// TODO: connect to GET /api/v1/firmware when endpoint exists
const ALL_DEVICES: Array<{ id: string; name: string; type: string; current: string; latest: string; status: string; date: string; progress: number }> = []

const FILTERS = [
  { label: 'Todos', value: 'all', count: 0 },
  { label: 'Atualizados', value: 'current', count: 0 },
  { label: 'Desatualizados', value: 'outdated', count: 0 },
  { label: 'Falhas', value: 'failed', count: 0 },
  { label: 'Atualizando', value: 'pending', count: 0 },
]

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  current: { label: 'Atualizado', className: 'current' },
  outdated: { label: 'Desatualizado', className: 'outdated' },
  failed: { label: 'Falhou', className: 'failed' },
  pending: { label: 'Atualizando', className: 'pending' },
}

export default function FirmwarePage() {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? ALL_DEVICES : ALL_DEVICES.filter((d) => d.status === filter)

  const stats = [
    { label: 'Dispositivos', value: 0, className: 'accent' },
    { label: 'Atualizados', value: 0, className: 'success' },
    { label: 'Desatualizados', value: 0, className: 'warning' },
    { label: 'Falhas OTA', value: 0, className: 'danger' },
  ]

  return (
    <>
      <div className="kpi-grid">
        {stats.map((s) => (
          <div className="kpi-card" key={s.label}>
            <div className="kpi-card-header">
              <span className="kpi-card-label">{s.label}</span>
              <div className={`kpi-card-icon ${s.className}`}><HardDrive /></div>
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
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto' }}><RefreshCw /> Verificar</button>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto', background: 'var(--fg)', color: 'var(--bg)' }}><Upload /> Atualização OTA</button>
          </div>
        </div>
        <div className="widget-body" style={{ padding: 0, overflowX: 'auto' }}>
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: 48 }}>
              <HardDrive size={32} />
              <div className="empty-state-text">Nenhum dispositivo com firmware cadastrado</div>
            </div>
          ) : (
            <table className="alarms-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Dispositivo</th>
                  <th>Versão Atual</th>
                  <th>Versão Mais Recente</th>
                  <th>Status</th>
                  <th>Última Atualização</th>
                  <th>Progresso</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const status = STATUS_MAP[d.status]
                  return (
                    <tr key={d.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{d.name}</div>
                        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>{d.type}</div>
                      </td>
                      <td className="alarm-device">{d.current}</td>
                      <td className="alarm-device">{d.latest}</td>
                      <td>
                        <span className={`alarm-severity ${d.status === 'current' ? 'low' : 'medium'}`}>
                          <span className="alarm-severity-dot" />{status?.label ?? d.status}
                        </span>
                      </td>
                      <td className="alarm-time">{d.date}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 80, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: 2, width: `${d.progress}%`, background: d.progress === 100 ? 'var(--success)' : 'var(--info)', transition: 'width 300ms ease' }} />
                          </div>
                          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg)' }}>{d.progress}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="alarm-actions">
                          <button className="alarm-action-btn"><RefreshCw /></button>
                          <button className="alarm-action-btn"><HardDrive /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
          Mostrando {filtered.length} de {ALL_DEVICES.length} dispositivos
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="widget-action-btn" disabled style={{ opacity: 0.4 }}>1</button>
          <button className="widget-action-btn" style={{ width: 'auto', padding: '0 8px', minWidth: 32, background: 'var(--surface-hover)' }}>1</button>
        </div>
      </div>
    </>
  )
}
