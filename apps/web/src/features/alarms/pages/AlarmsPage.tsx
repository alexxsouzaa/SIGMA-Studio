import { useState } from 'react'
import { BellRing, Download, X, AlertTriangle, Info, ChevronLeft, ChevronRight, BellOff, AlertOctagon, FileText } from 'lucide-react'
import { useApi } from '@/lib/hooks'
import { request } from '@/lib/api'
import { pushToast } from '@/lib/toastStore'
import { exportCSV, exportPDF, escapeHTML } from '@/lib/export'
import { LoadingSpinner, ErrorState } from '@/components/shared/StatusStates'

interface Alert {
  id: number; device_id: number; alarm_type: string; level: string
  value: number | null; threshold: number | null; acknowledged: boolean; created_at: string
}

const FILTERS = [
  { label: 'Todos', value: undefined, color: 'var(--fg-secondary)' },
  { label: 'Critico', value: 'critical', color: 'var(--danger)' },
  { label: 'Alerta', value: 'warning', color: 'var(--warning)' },
  { label: 'Info', value: 'info', color: 'var(--info)' },
]

const SEV_ICONS: Record<string, { icon: typeof AlertOctagon; color: string; bg: string }> = {
  critical: { icon: AlertOctagon, color: 'var(--danger)', bg: 'var(--danger-muted)' },
  warning: { icon: AlertTriangle, color: 'var(--warning)', bg: 'var(--warning-muted)' },
  info: { icon: Info, color: 'var(--info)', bg: 'var(--info-muted)' },
}

function statusLabel(a: Alert) {
  if (!a.acknowledged) return 'Ativo'
  return 'Confirmado'
}

function statusClass(a: Alert) {
  if (!a.acknowledged) return 'active'
  return 'acked'
}

export default function AlarmsPage() {
  const [filter, setFilter] = useState<string | undefined>(undefined)
  const [selectedAlarm, setSelectedAlarm] = useState<Alert | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [silencing, setSilencing] = useState(false)
  const query = filter ? `/alerts/?limit=50&level=${filter}` : '/alerts/?limit=50'
  const { data: alerts, isLoading, error, refetch } = useApi<Alert[]>(query)

  async function handleAcknowledge(alertId: number) {
    setPendingId(alertId)
    try {
      await request(`/alerts/${alertId}/acknowledge`, { method: 'POST' })
      pushToast('Alarme confirmado', 'Alarme marcado como confirmado.', 'success')
      refetch()
    } catch (err) {
      pushToast('Erro ao confirmar alarme', err instanceof Error ? err.message : 'Tente novamente', 'error')
    } finally {
      setPendingId(null)
    }
  }

  async function handleSilenceAll() {
    setSilencing(true)
    try {
      await request('/alerts/acknowledge-all', { method: 'POST' })
      pushToast('Alarmes silenciados', 'Todos os alarmes ativos foram confirmados.', 'success')
      refetch()
    } catch (err) {
      pushToast('Erro ao silenciar alarmes', err instanceof Error ? err.message : 'Tente novamente', 'error')
    } finally {
      setSilencing(false)
    }
  }

  const filtered = alerts ?? []
  const criticalCount = alerts?.filter((a) => a.level === 'critical' && !a.acknowledged).length ?? 0
  const warningCount = alerts?.filter((a) => a.level === 'warning' && !a.acknowledged).length ?? 0
  const infoCount = alerts?.filter((a) => a.level === 'info' && !a.acknowledged).length ?? 0

  function handleExportCSV() {
    const headers = ['Severidade', 'Dispositivo', 'Descricao', 'Valor', 'Limite', 'Status', 'Horario']
    const rows = filtered.map((a) => [
      a.level,
      `DEV-${String(a.device_id).padStart(3, '0')}`,
      a.alarm_type,
      a.value,
      a.threshold,
      statusLabel(a),
      new Date(a.created_at).toLocaleString('pt-BR'),
    ])
    exportCSV(`alarmes-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
  }

  function handleExportPDF() {
    const rows = filtered
      .map((a) => `<tr><td>${escapeHTML(a.level)}</td><td>DEV-${String(a.device_id).padStart(3, '0')}</td><td>${escapeHTML(a.alarm_type)}</td><td>${escapeHTML(a.value)}</td><td>${escapeHTML(new Date(a.created_at).toLocaleString('pt-BR'))}</td></tr>`)
      .join('')
    exportPDF(
      'Relatório de Alarmes',
      `<table><thead><tr><th>Severidade</th><th>Dispositivo</th><th>Descrição</th><th>Valor</th><th>Horário</th></tr></thead><tbody>${rows}</tbody></table>`,
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 20 }}>
      <div className="alarm-stats">
        <div className="alarm-stat">
          <div className="alarm-stat-icon total"><BellRing /></div>
          <div><div className="alarm-stat-value">{filtered.length}</div><div className="alarm-stat-label">Total de alarmes</div></div>
        </div>
        <div className="alarm-stat">
          <div className="alarm-stat-icon critical"><AlertOctagon /></div>
          <div><div className="alarm-stat-value">{criticalCount}</div><div className="alarm-stat-label">Críticos</div></div>
        </div>
        <div className="alarm-stat">
          <div className="alarm-stat-icon warning"><AlertTriangle /></div>
          <div><div className="alarm-stat-value">{warningCount}</div><div className="alarm-stat-label">Alertas</div></div>
        </div>
        <div className="alarm-stat">
          <div className="alarm-stat-icon info"><Info /></div>
          <div><div className="alarm-stat-value">{infoCount}</div><div className="alarm-stat-label">Informativos</div></div>
        </div>
      </div>

      <div className="alarm-toolbar">
        <div className="alarm-filters">
          {FILTERS.map((f) => {
            const isActive = filter === f.value
            const count = f.value ? (alerts ?? []).filter((a) => a.level === f.value).length : (alerts ?? []).length
            return (
              <button
                key={f.label}
                className={`filter-chip${isActive ? ' active' : ''}`}
                data-filter="severity"
                data-value={f.value ?? 'all'}
                aria-pressed={isActive}
                onClick={() => setFilter(isActive ? undefined : f.value)}
              >
                {isActive && <span className="filter-chip-dot" style={{ background: f.color }} />}
                {f.label}
                {count > 0 && <span className="filter-chip-count">{count}</span>}
              </button>
            )
          })}
        </div>
        <div className="alarm-actions">
          <button className="btn-ghost" onClick={handleExportCSV}><Download /> CSV</button>
          <button className="btn-ghost" onClick={handleExportPDF}><FileText /> PDF</button>
          <button className="btn-danger-outline" onClick={handleSilenceAll} disabled={silencing}><BellOff /> {silencing ? 'Silenciando...' : 'Silenciar todos'}</button>
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><BellRing /></div>
          <div className="empty-state-title">Nenhum alarme encontrado</div>
          <div className="empty-state-desc">Tente ajustar os filtros ou o termo de busca.</div>
        </div>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="alarm-list">
          {filtered.map((a) => {
            const sev = SEV_ICONS[a.level] ?? SEV_ICONS.info
            const SevIcon = sev.icon
            const isUnread = !a.acknowledged
            return (
              <div
                key={a.id}
                className={`alarm-row${isUnread ? ' unread' : ''}`}
                onClick={() => setSelectedAlarm(a)}
                tabIndex={0}
                role="listitem"
                aria-label={`Alarme: ${a.alarm_type}`}
              >
                <div className={`alarm-severity-icon ${a.level}`}><SevIcon /></div>
                <div className="alarm-main">
                  <div className="alarm-title">{a.alarm_type}</div>
                  <div className="alarm-desc">{a.threshold ? `Limite: ${a.threshold}` : ''}</div>
                </div>
                <div className="alarm-device">DEV-{String(a.device_id).padStart(3, '0')}</div>
                <div className="alarm-time">{new Date(a.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                <div className={`alarm-status-badge ${statusClass(a)}`}>{statusLabel(a)}</div>
                <button className="alarm-ack-btn" disabled={a.acknowledged || pendingId === a.id} onClick={(e) => { e.stopPropagation(); handleAcknowledge(a.id) }} aria-label={`Confirmar alarme ${a.alarm_type}`}>
                  {a.acknowledged ? 'Confirmado' : pendingId === a.id ? 'Confirmando...' : 'Confirmar'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="alarm-pagination">
        <span className="alarm-pagination-info">{filtered.length} alarme{(filtered.length !== 1 ? 's' : '')} no total</span>
        <div className="alarm-pagination-btns">
          <button className="alarm-pagination-btn" disabled aria-label="Página anterior"><ChevronLeft /></button>
          <button className="alarm-pagination-btn active">1</button>
          <button className="alarm-pagination-btn" aria-label="Próxima página"><ChevronRight /></button>
        </div>
      </div>

      {selectedAlarm && (
        <>
          <div className={`detail-overlay${selectedAlarm ? ' open' : ''}`} onClick={() => setSelectedAlarm(null)} />
          <div className={`detail-panel${selectedAlarm ? ' open' : ''}`} role="dialog" aria-label="Detalhes do alarme" aria-modal="true">
            <div className="detail-header">
              <span className="detail-header-title">{selectedAlarm.alarm_type}</span>
              <button className="detail-close" onClick={() => setSelectedAlarm(null)} aria-label="Fechar detalhes"><X /></button>
            </div>
            <div className="detail-body">
              <div className="detail-section">
                <div className="detail-section-title">Informações do Alarme</div>
                <div className="detail-info-grid">
                  {[
                    ['ID', `ALM-${String(selectedAlarm.id).padStart(3, '0')}`],
                    ['Severidade', selectedAlarm.level === 'critical' ? 'Crítico' : selectedAlarm.level === 'warning' ? 'Alerta' : 'Info'],
                    ['Dispositivo', `DEV-${String(selectedAlarm.device_id).padStart(3, '0')}`],
                    ['Valor atual', selectedAlarm.value != null ? String(selectedAlarm.value) : '---'],
                    ['Limite', selectedAlarm.threshold != null ? String(selectedAlarm.threshold) : '---'],
                    ['Status', statusLabel(selectedAlarm)],
                    ['Data/Hora', new Date(selectedAlarm.created_at).toLocaleString('pt-BR')],
                  ].map(([label, value]) => (
                    <div key={label} className="detail-info-item">
                      <span className="detail-info-label">{label}</span>
                      <span className="detail-info-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="detail-divider" />
              <div className="detail-section">
                <div className="detail-section-title">Histórico</div>
                <div className="alarm-timeline">
                  {[
                    { time: new Date(selectedAlarm.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), text: 'Alarme gerado', type: selectedAlarm.level },
                    ...(selectedAlarm.acknowledged ? [{ time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), text: 'Confirmado', type: 'resolved' as const }] : []),
                  ].map((t, i) => (
                    <div key={i} className={`alarm-timeline-item ${t.type}`}>
                      <div className="alarm-timeline-time">{t.time}</div>
                      <div>{t.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn-detail-close" onClick={() => setSelectedAlarm(null)}><X /> Fechar</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
