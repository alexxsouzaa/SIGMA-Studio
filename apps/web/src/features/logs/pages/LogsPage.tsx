import { useState } from 'react'
import { Download, Trash2, ChevronLeft, ChevronRight, FileText } from 'lucide-react'

type Sev = 'crit' | 'err' | 'warn' | 'info' | 'deb'

const SEV_MAP: Record<Sev, { label: string; className: string; color: string }> = {
  crit: { label: 'CRÍTICO', className: 'critical', color: 'var(--danger)' },
  err: { label: 'ERRO', className: 'high', color: 'var(--danger)' },
  warn: { label: 'AVISO', className: 'medium', color: 'var(--warning)' },
  info: { label: 'INFO', className: 'low', color: 'var(--info)' },
  deb: { label: 'DEBUG', className: 'low', color: 'var(--fg-muted)' },
}

// TODO: connect to GET /api/v1/logs when endpoint exists
const ALL_LOGS: Array<{ ts: string; sev: Sev; src: string; dev: string; msg: string }> = []

const FILTERS = [
  { label: 'Todos', value: 'all', count: 0, color: 'var(--fg-secondary)' },
  { label: 'Crítico', value: 'crit', count: 0, color: 'var(--danger)' },
  { label: 'Erro', value: 'err', count: 0, color: 'var(--danger)' },
  { label: 'Aviso', value: 'warn', count: 0, color: 'var(--warning)' },
  { label: 'Info', value: 'info', count: 0, color: 'var(--info)' },
  { label: 'Debug', value: 'deb', count: 0, color: 'var(--fg-muted)' },
]

export default function LogsPage() {
  const [filter, setFilter] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const filtered = filter === 'all' ? ALL_LOGS : ALL_LOGS.filter((l) => l.sev === filter)

  return (
    <>
      <div className="widget">
        <div className="widget-header" style={{ flexWrap: 'wrap', gap: 8 }}>
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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg-secondary)', cursor: 'pointer' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span
                  className={`refresh-dot${autoRefresh ? ' active' : ''}`}
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: autoRefresh ? 'var(--success)' : 'var(--fg-muted)',
                    animation: autoRefresh ? 'spin 2s ease-in-out infinite' : 'none',
                  }}
                />
                Auto-refresh
              </span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="toggle"
                style={{
                  display: 'inline-flex', alignItems: 'center', width: 40, height: 22,
                  background: autoRefresh ? 'var(--fg)' : 'var(--border)',
                  borderRadius: 11, position: 'relative', transition: 'background 150ms ease',
                }}
              >
                <span
                  style={{
                    width: 16, height: 16, borderRadius: '50%', background: autoRefresh ? 'var(--surface)' : 'var(--bg)',
                    position: 'absolute', left: autoRefresh ? 21 : 3, transition: 'left 150ms ease',
                  }}
                />
              </button>
            </label>
            <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto' }}><Download /> Exportar</button>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto', color: 'var(--danger)' }}><Trash2 /> Limpar</button>
          </div>
        </div>
        <div className="widget-body" style={{ padding: 0, overflowX: 'auto' }}>
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: 48 }}>
              <FileText size={32} />
              <div className="empty-state-text">Nenhum log encontrado</div>
            </div>
          ) : (
            <table className="alarms-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: 180 }}>Horário</th>
                  <th style={{ width: 100 }}>Severidade</th>
                  <th style={{ width: 140 }}>Fonte</th>
                  <th style={{ width: 120 }}>Dispositivo</th>
                  <th>Mensagem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => {
                  const sev = SEV_MAP[l.sev]
                  return (
                    <tr key={i} style={{ borderLeft: l.sev === 'crit' || l.sev === 'err' ? '2px solid var(--danger)' : l.sev === 'warn' ? '2px solid var(--warning)' : undefined }}>
                      <td className="alarm-time" style={{ fontSize: 11 }}>{l.ts}</td>
                      <td>
                        <span className={`alarm-severity ${sev.className}`} style={{ fontSize: 10 }}>
                          <span className="alarm-severity-dot" />{sev.label}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{l.src}</td>
                      <td className="alarm-device" style={{ fontSize: 11 }}>{l.dev}</td>
                      <td style={{ fontSize: 12, color: 'var(--fg-secondary)', lineHeight: 1.5 }}>{l.msg}</td>
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
          Mostrando {filtered.length} de {ALL_LOGS.length} logs
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="widget-action-btn" style={{ width: 'auto', padding: '0 8px', minWidth: 32 }}><ChevronLeft /></button>
          <button className="widget-action-btn" style={{ width: 'auto', padding: '0 8px', minWidth: 32, background: 'var(--surface-hover)' }}>1</button>
          <button className="widget-action-btn" style={{ width: 'auto', padding: '0 8px', minWidth: 32 }}>2</button>
          <button className="widget-action-btn" style={{ width: 'auto', padding: '0 8px', minWidth: 32 }}><ChevronRight /></button>
        </div>
      </div>
    </>
  )
}
