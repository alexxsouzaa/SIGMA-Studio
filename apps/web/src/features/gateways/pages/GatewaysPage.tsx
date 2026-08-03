import { useState, useMemo, useEffect } from 'react'
import { Router, Plus, X, Check, Trash2, Wifi, Cable, Radio, Bluetooth } from 'lucide-react'
import { useApi } from '@/lib/hooks'
import { request } from '@/lib/api'
import { LoadingSpinner, ErrorState } from '@/components/shared/StatusStates'
import type { Gateway, GatewayUpdate } from '@/types/gateway'

const FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Online', value: 'online' },
  { label: 'Alerta', value: 'warning' },
  { label: 'Offline', value: 'offline' },
]

const PROTOCOL_ICONS: Record<string, typeof Wifi> = {
  MQTT: Wifi,
  'Modbus TCP': Cable,
  'OPC-UA': Radio,
  'BLE 5.0': Bluetooth,
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  online: { label: 'Online', color: 'var(--success)' },
  warning: { label: 'Degradado', color: 'var(--warning)' },
  offline: { label: 'Offline', color: 'var(--danger)' },
}

export default function GatewaysPage() {
  const { data: gateways, isLoading, error, refetch } = useApi<Gateway[]>('/gateways/')
  const [filter, setFilter] = useState('all')
  const [panelMode, setPanelMode] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Gateway | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const [form, setForm] = useState({ name: '', protocol: 'MQTT', endpoint: '', status: 'online' })

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const onlineCount = (gateways ?? []).filter((g) => g.status === 'online').length
  const warningCount = (gateways ?? []).filter((g) => g.status === 'warning').length
  const offlineCount = (gateways ?? []).filter((g) => g.status === 'offline').length
  const total = gateways?.length ?? 0

  const filtered = useMemo(() => {
    const list = gateways ?? []
    if (filter === 'all') return list
    return list.filter((g) => g.status === filter)
  }, [gateways, filter])

  function openCreate() {
    setEditing(null)
    setConfirmDelete(false)
    setForm({ name: '', protocol: 'MQTT', endpoint: '', status: 'online' })
    setPanelMode('create')
  }

  function openEdit(g: Gateway) {
    setEditing(g)
    setConfirmDelete(false)
    setForm({ name: g.name, protocol: g.protocol, endpoint: g.endpoint ?? '', status: g.status })
    setPanelMode('edit')
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        protocol: form.protocol,
        endpoint: form.endpoint.trim() || null,
        status: form.status,
        organization_id: 1,
      }
      if (panelMode === 'create') {
        await request<Gateway>('/gateways/', { method: 'POST', body: JSON.stringify(payload) })
        showToast('Gateway criado com sucesso')
      } else if (editing) {
        const update: GatewayUpdate = { ...payload }
        await request<Gateway>(`/gateways/${editing.id}`, { method: 'PUT', body: JSON.stringify(update) })
        showToast('Gateway salvo com sucesso')
      }
      setPanelMode(null)
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao salvar gateway')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editing) return
    setSaving(true)
    try {
      await request(`/gateways/${editing.id}`, { method: 'DELETE' })
      showToast('Gateway excluído com sucesso')
      setPanelMode(null)
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao excluir gateway')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPanelMode(null)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <>
      <div className="kpi-grid">
        {[
          { label: 'Gateways', value: total, className: 'accent', icon: Router },
          { label: 'Online', value: onlineCount, className: 'success', icon: Wifi },
          { label: 'Alerta', value: warningCount, className: 'warning', icon: Radio },
          { label: 'Offline', value: offlineCount, className: 'danger', icon: Cable },
        ].map((s) => (
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
                {f.label}
                <span className="filter-chip-count">
                  {f.value === 'all' ? total : f.value === 'online' ? onlineCount : f.value === 'warning' ? warningCount : offlineCount}
                </span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto', background: 'var(--fg)', color: 'var(--bg)' }} onClick={openCreate}>
              <Plus /> Adicionar Gateway
            </button>
          </div>
        </div>

        <div className="widget-body" style={{ padding: 0, overflowX: 'auto' }}>
          {isLoading && <LoadingSpinner />}
          {error && <ErrorState message={error} onRetry={refetch} />}
          {!isLoading && !error && filtered.length === 0 && (
            <div className="empty-state" style={{ padding: 48 }}>
              <Router size={32} />
              <div className="empty-state-text">Nenhum gateway configurado</div>
            </div>
          )}
          {!isLoading && !error && filtered.length > 0 && (
            <table className="alarms-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Gateway</th>
                  <th>Protocolo</th>
                  <th>Endpoint</th>
                  <th>Status</th>
                  <th>Dispositivos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => {
                  const Icon = PROTOCOL_ICONS[g.protocol] ?? Router
                  const st = STATUS_MAP[g.status] ?? STATUS_MAP.offline
                  return (
                    <tr key={g.id} onClick={() => openEdit(g)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="gateway-item-icon" style={{ width: 32, height: 32 }}><Icon /></div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{g.name}</div>
                            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>{g.uuid?.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="alarm-device">{g.protocol}</td>
                      <td style={{ fontSize: 12, color: 'var(--fg-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.endpoint || '—'}</td>
                      <td>
                        <span className={`gateway-item-status ${g.status}`} style={{ color: st.color }}>
                          <span className="gateway-item-status-dot" />{st.label}
                        </span>
                      </td>
                      <td className="alarm-device">{g.devices_count}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="alarm-actions">
                          <button className="alarm-action-btn" onClick={() => openEdit(g)} aria-label="Editar"><Check /></button>
                          <button className="alarm-action-btn" onClick={() => { setEditing(g); setConfirmDelete(true) }} aria-label="Excluir"><Trash2 /></button>
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

      {panelMode && (
        <div className="detail-overlay" onClick={() => setPanelMode(null)}>
          <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header">
              <h3>{panelMode === 'create' ? 'Novo Gateway' : 'Editar Gateway'}</h3>
              <button onClick={() => setPanelMode(null)} aria-label="Fechar"><X /></button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="login-label" htmlFor="gw-name">Nome</label>
                <div className="login-input-wrap">
                  <input id="gw-name" className="login-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="GW-Principal" />
                </div>
              </div>
              <div>
                <label className="login-label" htmlFor="gw-protocol">Protocolo</label>
                <select id="gw-protocol" className="login-input" value={form.protocol} onChange={(e) => setForm({ ...form, protocol: e.target.value })} style={{ width: '100%' }}>
                  <option value="MQTT">MQTT</option>
                  <option value="Modbus TCP">Modbus TCP</option>
                  <option value="OPC-UA">OPC-UA</option>
                  <option value="BLE 5.0">BLE 5.0</option>
                </select>
              </div>
              <div>
                <label className="login-label" htmlFor="gw-endpoint">Endpoint</label>
                <div className="login-input-wrap">
                  <input id="gw-endpoint" className="login-input" value={form.endpoint} onChange={(e) => setForm({ ...form, endpoint: e.target.value })} placeholder="mqtt://broker.local:1883" />
                </div>
              </div>
              <div>
                <label className="login-label" htmlFor="gw-status">Status</label>
                <select id="gw-status" className="login-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ width: '100%' }}>
                  <option value="online">Online</option>
                  <option value="warning">Degradado</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              {panelMode === 'edit' && !confirmDelete && (
                <button className="widget-action-btn" onClick={() => setConfirmDelete(true)} style={{ padding: '8px 18px', width: '100%', justifyContent: 'center', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)' }}>
                  Excluir gateway
                </button>
              )}
              {panelMode === 'edit' && confirmDelete && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="widget-action-btn" onClick={handleDelete} disabled={saving} style={{ flex: 1, padding: '8px', justifyContent: 'center', background: 'var(--danger)', color: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                    {saving ? 'Excluindo...' : 'Confirmar exclusão'}
                  </button>
                  <button className="widget-action-btn" onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '8px', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    Cancelar
                  </button>
                </div>
              )}
              <button className="widget-action-btn" onClick={handleSave} disabled={saving} style={{ padding: '8px 18px', width: '100%', justifyContent: 'center', background: 'var(--fg)', color: 'var(--bg)' }}>
                {saving ? 'Salvando...' : <><Check size={16} /> Salvar alterações</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast" style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--fg)', color: 'var(--bg)', padding: '10px 18px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500, boxShadow: 'var(--shadow-md)', zIndex: 200 }}><Check size={16} /> {toast}</div>}
    </>
  )
}
