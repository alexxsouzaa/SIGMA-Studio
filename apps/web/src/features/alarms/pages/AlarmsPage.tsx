import { useState } from 'react'
import { BellRing, Download, X, Eye, AlertTriangle, Info, ShieldAlert } from 'lucide-react'
import { useApi } from '@/lib/hooks'
import { LoadingSpinner, ErrorState, EmptyState } from '@/components/shared/StatusStates'

interface Alert {
  id: number
  device_id: number
  alarm_type: string
  level: string
  value: number | null
  threshold: number | null
  acknowledged: boolean
  created_at: string
}

const FILTERS = [
  { label: 'Todos', value: undefined, color: 'var(--fg-secondary)' },
  { label: 'Critico', value: 'critical', color: 'var(--danger)' },
  { label: 'Alerta', value: 'warning', color: 'var(--warning)' },
  { label: 'Info', value: 'info', color: 'var(--info)' },
]

const SEV_MAP: Record<string, { label: string; className: string }> = {
  critical: { label: 'Critico', className: 'critical' },
  warning: { label: 'Alerta', className: 'high' },
  info: { label: 'Informativo', className: 'medium' },
}

export default function AlarmsPage() {
  const [filter, setFilter] = useState<string | undefined>(undefined)
  const [selectedAlarm, setSelectedAlarm] = useState<Alert | null>(null)

  const query = filter ? `/alerts/?limit=50&level=${filter}` : '/alerts/?limit=50'
  const { data: alerts, isLoading, error, refetch } = useApi<Alert[]>(query)

  const filtered = alerts ?? []
  const criticalCount = alerts?.filter((a) => a.level === 'critical' && !a.acknowledged).length ?? 0
  const warningCount = alerts?.filter((a) => a.level === 'warning' && !a.acknowledged).length ?? 0
  const infoCount = alerts?.filter((a) => a.level === 'info' && !a.acknowledged).length ?? 0

  const stats = [
    { label: 'Total', value: filtered.length, icon: BellRing, className: 'accent' },
    { label: 'Criticos', value: criticalCount, icon: ShieldAlert, className: 'danger' },
    { label: 'Alertas', value: warningCount, icon: AlertTriangle, className: 'warning' },
    { label: 'Informativos', value: infoCount, icon: Info, className: 'info' },
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
            {FILTERS.map((f) => {
              const isActive = filter === f.value
              return (
                <button
                  key={f.label}
                  className={`filter-chip${isActive ? ' active' : ''}`}
                  onClick={() => setFilter(isActive ? undefined : f.value)}
                >
                  {isActive && <span className="filter-chip-dot" style={{ background: f.color }} />}
                  {f.label}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto' }}>
              <Download /> Exportar
            </button>
          </div>
        </div>
        <div className="widget-body" style={{ padding: 0 }}>
          {isLoading && <LoadingSpinner />}
          {error && <ErrorState message={error} onRetry={refetch} />}
          {!isLoading && !error && filtered.length === 0 && (
            <EmptyState title="Nenhum alarme encontrado" icon={<BellRing />} />
          )}
          {!isLoading && !error && filtered.length > 0 && (
            <table className="alarms-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Severidade</th>
                  <th>Alarme</th>
                  <th>Dispositivo</th>
                  <th>Valor</th>
                  <th>Horario</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const sev = SEV_MAP[a.level] ?? SEV_MAP.info
                  return (
                    <tr key={a.id} onClick={() => setSelectedAlarm(a)} style={{ cursor: 'pointer' }}>
                      <td><span className={`alarm-severity ${sev.className}`}><span className="alarm-severity-dot" />{sev.label}</span></td>
                      <td style={{ maxWidth: 280 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.alarm_type}</div>
                        <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>Limite: {a.threshold ?? '-'}</div>
                      </td>
                      <td className="alarm-device">DEV-{String(a.device_id).padStart(3, '0')}</td>
                      <td className="alarm-device">{a.value != null ? a.value : '---'}</td>
                      <td className="alarm-time">{new Date(a.created_at).toLocaleTimeString('pt-BR')}</td>
                      <td>{a.acknowledged ? 'Reconhecido' : 'Ativo'}</td>
                      <td>
                        <div className="alarm-actions">
                          <button className="alarm-action-btn" title="Detalhes"><Eye /></button>
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

      {selectedAlarm && (
        <>
          <div className="detail-overlay" onClick={() => setSelectedAlarm(null)} />
          <div className="detail-panel open" style={{ zIndex: 51 }}>
            <div className="detail-header">
              <h3>{selectedAlarm.alarm_type}</h3>
              <button onClick={() => setSelectedAlarm(null)}><X /></button>
            </div>
            <div className="detail-body">
              <div className="detail-section">
                <div className="detail-section-title">Informacoes do Alarme</div>
                <div className="detail-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    ['ID', `ALM-${String(selectedAlarm.id).padStart(3, '0')}`],
                    ['Severidade', SEV_MAP[selectedAlarm.level]?.label ?? selectedAlarm.level],
                    ['Dispositivo', `DEV-${String(selectedAlarm.device_id).padStart(3, '0')}`],
                    ['Valor atual', selectedAlarm.value != null ? String(selectedAlarm.value) : '---'],
                    ['Limite', selectedAlarm.threshold != null ? String(selectedAlarm.threshold) : '---'],
                    ['Status', selectedAlarm.acknowledged ? 'Reconhecido' : 'Ativo'],
                    ['Data/Hora', new Date(selectedAlarm.created_at).toLocaleString('pt-BR')],
                  ].map(([label, value]) => (
                    <div key={label} className="detail-info-item">
                      <div style={{ fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="detail-actions">
                <button className="widget-action-btn" style={{ flex: 1, padding: '8px', width: 'auto' }} onClick={() => setSelectedAlarm(null)}>Fechar</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
