import { useState } from 'react'
import { HardDrive, Upload, RefreshCw, Plus, X, Check } from 'lucide-react'
import { useApi } from '@/lib/hooks'
import { request } from '@/lib/api'
import { LoadingSpinner, ErrorState } from '@/components/shared/StatusStates'
import type { DeviceFirmwareStatus, Firmware } from '@/types/firmware'

const FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Atualizados', value: 'current' },
  { label: 'Desatualizados', value: 'outdated' },
  { label: 'Falhas', value: 'failed' },
  { label: 'Atualizando', value: 'pending' },
]

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  current: { label: 'Atualizado', className: 'low' },
  outdated: { label: 'Desatualizado', className: 'medium' },
  failed: { label: 'Falhou', className: 'high' },
  pending: { label: 'Atualizando', className: 'medium' },
}

export default function FirmwarePage() {
  const { data: statusList, isLoading, error, refetch } = useApi<DeviceFirmwareStatus[]>('/firmware/status')
  const { data: firmwares, refetch: refetchFw } = useApi<Firmware[]>('/firmware/')
  const [filter, setFilter] = useState('all')
  const [panelOpen, setPanelOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [version, setVersion] = useState('')
  const [description, setDescription] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const devices = statusList ?? []
  const filtered = filter === 'all' ? devices : devices.filter((d) => d.status === filter)

  const currentCount = devices.filter((d) => d.status === 'current').length
  const outdatedCount = devices.filter((d) => d.status === 'outdated').length
  const latestVersion = devices[0]?.latest ?? '—'

  async function handleCreate() {
    if (!version.trim()) return
    setSaving(true)
    try {
      await request<Firmware>('/firmware/', {
        method: 'POST',
        body: JSON.stringify({ version: version.trim(), description: description.trim() || null }),
      })
      showToast('Firmware cadastrado com sucesso')
      setPanelOpen(false)
      setVersion('')
      setDescription('')
      refetchFw()
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao cadastrar firmware')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="kpi-grid">
        {[
          { label: 'Dispositivos', value: devices.length, className: 'accent', icon: HardDrive },
          { label: 'Atualizados', value: currentCount, className: 'success', icon: Check },
          { label: 'Desatualizados', value: outdatedCount, className: 'warning', icon: Upload },
          { label: 'Última versão', value: latestVersion, className: 'info', icon: HardDrive },
        ].map((s) => (
          <div className="kpi-card" key={s.label}>
            <div className="kpi-card-header">
              <span className="kpi-card-label">{s.label}</span>
              <div className={`kpi-card-icon ${s.className}`}><s.icon /></div>
            </div>
            <div className="kpi-card-value">{typeof s.value === 'string' ? s.value : s.value.toLocaleString('pt-BR')}</div>
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
                <span className="filter-chip-count">
                  {f.value === 'all' ? devices.length : devices.filter((d) => d.status === f.value).length}
                </span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto' }} onClick={() => refetch()}><RefreshCw /> Verificar</button>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto', background: 'var(--fg)', color: 'var(--bg)' }} onClick={() => setPanelOpen(true)}><Plus /> Nova versão</button>
          </div>
        </div>
        <div className="widget-body" style={{ padding: 0, overflowX: 'auto' }}>
          {isLoading && <LoadingSpinner />}
          {error && <ErrorState message={error} onRetry={refetch} />}
          {!isLoading && !error && filtered.length === 0 && (
            <div className="empty-state" style={{ padding: 48 }}>
              <HardDrive size={32} />
              <div className="empty-state-text">Nenhum dispositivo com firmware cadastrado</div>
            </div>
          )}
          {!isLoading && !error && filtered.length > 0 && (
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
                  const status = STATUS_MAP[d.status] ?? STATUS_MAP.current
                  return (
                    <tr key={d.device_id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{d.name}</div>
                        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>DEV-{String(d.device_id).padStart(3, '0')}</div>
                      </td>
                      <td className="alarm-device">{d.current}</td>
                      <td className="alarm-device">{d.latest}</td>
                      <td>
                        <span className={`alarm-severity ${status.className}`}>
                          <span className="alarm-severity-dot" />{status.label}
                        </span>
                      </td>
                      <td className="alarm-time">{d.date ?? '—'}</td>
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
                          {d.status === 'outdated' && (
                            <button className="alarm-action-btn" onClick={() => showToast(`Atualização OTA iniciada para ${d.name}`)} title="Atualizar" style={{ color: 'var(--info)' }}><Upload /></button>
                          )}
                          <button className="alarm-action-btn" onClick={() => showToast(`Detalhes de ${d.name}`)} title="Detalhes"><HardDrive /></button>
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
          Mostrando {filtered.length} de {devices.length} dispositivos
        </span>
        <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
          {firmwares?.length ?? 0} versões cadastradas
        </span>
      </div>

      {panelOpen && (
        <div className="detail-overlay" onClick={() => setPanelOpen(false)}>
          <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header">
              <h3>Cadastrar nova versão de firmware</h3>
              <button onClick={() => setPanelOpen(false)} aria-label="Fechar"><X /></button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="login-label" htmlFor="fw-version">Versão</label>
                <div className="login-input-wrap">
                  <input id="fw-version" className="login-input" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="2.1.0" />
                </div>
              </div>
              <div>
                <label className="login-label" htmlFor="fw-desc">Descrição</label>
                <div className="login-input-wrap">
                  <input id="fw-desc" className="login-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Correções e melhorias" />
                </div>
              </div>
              <button className="widget-action-btn" onClick={handleCreate} disabled={saving} style={{ padding: '8px 18px', width: '100%', justifyContent: 'center', background: 'var(--fg)', color: 'var(--bg)' }}>
                {saving ? 'Salvando...' : <><Check size={16} /> Cadastrar</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast" style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--fg)', color: 'var(--bg)', padding: '10px 18px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500, boxShadow: 'var(--shadow-md)', zIndex: 200 }}><Check size={16} /> {toast}</div>}
    </>
  )
}
