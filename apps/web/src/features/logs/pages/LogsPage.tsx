import { useState } from 'react'
import { Download, Trash2, ChevronLeft, ChevronRight, FileText, RefreshCw } from 'lucide-react'
import { useApi } from '@/lib/hooks'
import { request } from '@/lib/api'
import { exportCSV } from '@/lib/export'
import { LoadingSpinner, ErrorState } from '@/components/shared/StatusStates'

interface LogItem {
  id: number
  device_id: number | null
  user_id: number | null
  level: string
  source: string | null
  message: string
  details: string | null
  created_at: string
}

const SEV_MAP: Record<string, { label: string; className: string; color: string }> = {
  crit: { label: 'CRÍTICO', className: 'critical', color: 'var(--danger)' },
  err: { label: 'ERRO', className: 'high', color: 'var(--danger)' },
  warn: { label: 'AVISO', className: 'medium', color: 'var(--warning)' },
  info: { label: 'INFO', className: 'low', color: 'var(--info)' },
  deb: { label: 'DEBUG', className: 'low', color: 'var(--fg-muted)' },
}

const FILTERS = [
  { label: 'Todos', value: 'all', color: 'var(--fg-secondary)' },
  { label: 'Erro', value: 'err', color: 'var(--danger)' },
  { label: 'Aviso', value: 'warn', color: 'var(--warning)' },
  { label: 'Info', value: 'info', color: 'var(--info)' },
]

export default function LogsPage() {
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)
  const PAGE_SIZE = 50

  const levelParam = filter === 'all' ? '' : `&level=${filter}`
  const endpoint = `/logs/?skip=${(page - 1) * PAGE_SIZE}&limit=${PAGE_SIZE}${levelParam}`
  const { data: logs, isLoading, error, refetch } = useApi<LogItem[]>(endpoint, {
    refreshInterval: autoRefresh ? 10000 : undefined,
  })

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function handleExport() {
    const headers = ['Horario', 'Severidade', 'Fonte', 'Dispositivo', 'Mensagem']
    const rows = (logs ?? []).map((l) => [
      new Date(l.created_at).toLocaleString('pt-BR'),
      l.level,
      l.source ?? '—',
      l.device_id ? `DEV-${String(l.device_id).padStart(3, '0')}` : '—',
      l.message,
    ])
    exportCSV(`logs-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
  }

  async function handleClear() {
    setClearing(true)
    try {
      const res = await request<{ deleted: number }>('/logs/', { method: 'DELETE' })
      showToast(`${res.data.deleted} log(s) removido(s)`)
      setConfirmClear(false)
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao limpar logs')
      setConfirmClear(false)
    } finally {
      setClearing(false)
    }
  }

  const items = logs ?? []

  return (
    <>
      <div className="widget">
        <div className="widget-header" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={`filter-chip${filter === f.value ? ' active' : ''}`}
                onClick={() => { setFilter(f.value); setPage(1) }}
              >
                {filter === f.value && <span className="filter-chip-dot" style={{ background: f.color }} />}
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg-secondary)', cursor: 'pointer' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: autoRefresh ? 'var(--success)' : 'var(--fg-muted)',
                    animation: autoRefresh ? 'spin 2s ease-in-out infinite' : 'none',
                  }}
                />
                Auto-refresh
              </span>
              <button onClick={() => setAutoRefresh(!autoRefresh)} className="toggle" style={{ display: 'inline-flex', alignItems: 'center', width: 40, height: 22, background: autoRefresh ? 'var(--fg)' : 'var(--border)', borderRadius: 11, position: 'relative', transition: 'background 150ms ease' }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: autoRefresh ? 'var(--surface)' : 'var(--bg)', position: 'absolute', left: autoRefresh ? 21 : 3, transition: 'left 150ms ease' }} />
              </button>
            </label>
            <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto' }} onClick={handleExport}><Download /> Exportar</button>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto' }} onClick={() => { refetch(); showToast('Logs atualizados') }}><RefreshCw /> Atualizar</button>
            {confirmClear ? (
              <>
                <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto', color: 'var(--danger)' }} onClick={handleClear} disabled={clearing}>{clearing ? 'Limpando...' : 'Confirmar'}</button>
                <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto' }} onClick={() => setConfirmClear(false)} disabled={clearing}>Cancelar</button>
              </>
            ) : (
              <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto', color: 'var(--danger)' }} onClick={() => setConfirmClear(true)}><Trash2 /> Limpar</button>
            )}
          </div>
        </div>
        <div className="widget-body" style={{ padding: 0, overflowX: 'auto' }}>
          {isLoading && <LoadingSpinner />}
          {error && <ErrorState message={error} onRetry={refetch} />}
          {!isLoading && !error && items.length === 0 && (
            <div className="empty-state" style={{ padding: 48 }}>
              <FileText size={32} />
              <div className="empty-state-text">Nenhum log encontrado</div>
            </div>
          )}
          {!isLoading && !error && items.length > 0 && (
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
                {items.map((l) => {
                  const sev = SEV_MAP[l.level] ?? SEV_MAP.info
                  const isError = l.level === 'crit' || l.level === 'err'
                  return (
                    <tr key={l.id} style={{ borderLeft: isError ? '2px solid var(--danger)' : l.level === 'warn' ? '2px solid var(--warning)' : undefined }}>
                      <td className="alarm-time" style={{ fontSize: 11 }}>{new Date(l.created_at).toLocaleString('pt-BR')}</td>
                      <td>
                        <span className={`alarm-severity ${sev.className}`} style={{ fontSize: 10 }}>
                          <span className="alarm-severity-dot" />{sev.label}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{l.source ?? '—'}</td>
                      <td className="alarm-device" style={{ fontSize: 11 }}>{l.device_id ? `DEV-${String(l.device_id).padStart(3, '0')}` : '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--fg-secondary)', lineHeight: 1.5 }}>{l.message}</td>
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
          Página {page} · {items.length} logs
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="widget-action-btn" style={{ width: 'auto', padding: '0 8px', minWidth: 32 }} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}><ChevronLeft /></button>
          <button className="widget-action-btn" style={{ width: 'auto', padding: '0 8px', minWidth: 32, background: 'var(--surface-hover)' }}>{page}</button>
          <button className="widget-action-btn" style={{ width: 'auto', padding: '0 8px', minWidth: 32 }} onClick={() => setPage((p) => p + 1)}><ChevronRight /></button>
        </div>
      </div>

      {toast && <div className="toast" style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--fg)', color: 'var(--bg)', padding: '10px 18px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500, boxShadow: 'var(--shadow-md)', zIndex: 200 }}>{toast}</div>}
    </>
  )
}
