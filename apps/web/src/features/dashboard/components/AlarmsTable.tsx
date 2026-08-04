import { useState } from 'react'
import { Filter, Download, ExternalLink, Check, BellRing, Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '@/lib/hooks'
import { request } from '@/lib/api'
import { exportCSV } from '@/lib/export'
import { LoadingSpinner, ErrorState, EmptyState } from '@/components/shared/StatusStates'
import { pushToast } from '@/lib/toastStore'

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

const SEV_MAP: Record<string, { label: string; className: string }> = {
  critical: { label: 'Critico', className: 'critical' },
  error: { label: 'Erro', className: 'high' },
  warning: { label: 'Alto', className: 'medium' },
  info: { label: 'Baixo', className: 'low' },
}

function handleExport(alerts: Alert[]) {
  const headers = ['Severidade', 'Dispositivo', 'Descricao', 'Valor', 'Limite', 'Horario']
  const rows = alerts.map((a) => {
    const sev = SEV_MAP[a.level] ?? SEV_MAP.info
    return [
      sev.label,
      `DEV-${String(a.device_id).padStart(3, '0')}`,
      a.alarm_type,
      a.value,
      a.threshold,
      new Date(a.created_at).toLocaleString('pt-BR'),
    ]
  })
  exportCSV(`alarmes-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
}

export function AlarmsTable() {
  const { data: alerts, isLoading, error, refetch } = useApi<Alert[]>('/alerts/?limit=5', { refreshInterval: 30000 })
  const [acknowledging, setAcknowledging] = useState<number | null>(null)
  const navigate = useNavigate()

  async function handleAcknowledge(alertId: number) {
    setAcknowledging(alertId)
    try {
      await request(`/alerts/${alertId}/acknowledge`, { method: 'POST' })
      refetch()
    } catch {
      pushToast('Erro ao confirmar alarme', 'Tente novamente', 'error')
    } finally {
      setAcknowledging(null)
    }
  }

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="widget-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BellRing size={16} style={{ color: 'var(--fg-muted)' }} />
            Alarmes Recentes
          </span>
        </div>
        <div className="widget-actions">
          <button className="widget-action-btn" aria-label="Filtrar" onClick={() => navigate('/app/alarms')}>
            <Filter />
          </button>
          <button className="widget-action-btn" aria-label="Download" onClick={() => alerts && handleExport(alerts)}>
            <Download />
          </button>
          <button className="widget-action-btn" aria-label="Ver todos" onClick={() => navigate('/app/alarms')}>
            <ExternalLink />
          </button>
        </div>
      </div>
      <div className="widget-body widget-body-flush">
        {isLoading && <LoadingSpinner />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!isLoading && !error && (!alerts || alerts.length === 0) && (
          <EmptyState title="Nenhum alarme ativo" description="Nenhum alerta encontrado no sistema." />
        )}
        {!isLoading && !error && alerts && alerts.length > 0 && (
          <table className="alarms-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Severidade</th>
                <th>Dispositivo</th>
                <th>Descricao</th>
                <th>Valor</th>
                <th>Horario</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => {
                const sev = SEV_MAP[a.level] ?? SEV_MAP.info
                const isAcknowledging = acknowledging === a.id
                return (
                  <tr key={a.id}>
                    <td>
                      <span className={`alarm-severity ${sev.className}`}>
                        <span className="alarm-severity-dot" />{sev.label}
                      </span>
                    </td>
                    <td className="alarm-device">DEV-{String(a.device_id).padStart(3, '0')}</td>
                    <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: 'var(--fg-secondary)' }}>
                      {a.alarm_type}
                    </td>
                    <td className="alarm-device">
                      {a.value != null ? `${a.value} / ${a.threshold ?? '-'}` : '---'}
                    </td>
                    <td className="alarm-time">
                      {new Date(a.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td>
                      <div className="alarm-actions">
                        {!a.acknowledged && (
                          <button
                            className="alarm-action-btn"
                            title="Confirmar"
                            disabled={isAcknowledging}
                            onClick={() => handleAcknowledge(a.id)}
                          >
                            {isAcknowledging ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check />}
                          </button>
                        )}
                        <button className="alarm-action-btn" title="Detalhes" onClick={() => navigate('/app/alarms')}>
                          <ExternalLink />
                        </button>
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
  )
}
