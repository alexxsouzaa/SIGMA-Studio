import { useState } from 'react'
import { Brain, Upload, Plus, X, Check, Trash2, Rocket } from 'lucide-react'
import { useApi } from '@/lib/hooks'
import { request } from '@/lib/api'
import { LoadingSpinner, ErrorState } from '@/components/shared/StatusStates'
import type { AIModel, AIModelCreate } from '@/types/aiModel'

const FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Em produção', value: 'deployed' },
  { label: 'Em treinamento', value: 'training' },
  { label: 'Staging', value: 'staging' },
  { label: 'Arquivados', value: 'archived' },
]

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  deployed: { label: 'Em produção', color: 'var(--success)', bg: 'var(--success-muted)' },
  training: { label: 'Em treinamento', color: 'var(--warning)', bg: 'var(--warning-muted)' },
  staging: { label: 'Staging', color: 'var(--info)', bg: 'var(--info-muted)' },
  archived: { label: 'Arquivado', color: 'var(--fg-muted)', bg: 'var(--surface-hover)' },
}

export default function IAPage() {
  const { data: models, isLoading, error, refetch } = useApi<AIModel[]>('/ai/models/')
  const [filter, setFilter] = useState('all')
  const [panelOpen, setPanelOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [form, setForm] = useState<AIModelCreate>({
    name: '', type: 'anomaly', framework: 'TinyML', accuracy: 0, latency: 0, f1: 0, device: '', size: '—', description: '',
  })

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const all = models ?? []
  const filtered = filter === 'all' ? all : all.filter((m) => m.status === filter)
  const deployedCount = all.filter((m) => m.status === 'deployed').length
  const trainingCount = all.filter((m) => m.status === 'training').length

  async function handleCreate() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await request<AIModel>('/ai/models/', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          device: form.device?.trim() || null,
          size: form.size?.trim() || null,
          description: form.description?.trim() || null,
        }),
      })
      showToast('Modelo criado com sucesso')
      setPanelOpen(false)
      setForm({ name: '', type: 'anomaly', framework: 'TinyML', accuracy: 0, latency: 0, f1: 0, device: '', size: '—', description: '' })
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao criar modelo')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeploy(m: AIModel) {
    setSaving(true)
    try {
      await request(`/ai/models/${m.id}/deploy`, { method: 'POST' })
      showToast(`${m.name} implantado em produção`)
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao implantar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(m: AIModel) {
    setSaving(true)
    try {
      await request(`/ai/models/${m.id}`, { method: 'DELETE' })
      showToast('Modelo excluído')
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="kpi-grid">
        {[
          { label: 'Modelos totais', value: all.length, className: 'info', icon: Brain },
          { label: 'Em produção', value: deployedCount, className: 'success', icon: Rocket },
          { label: 'Em treinamento', value: trainingCount, className: 'warning', icon: Brain },
          { label: 'Staging', value: all.filter((m) => m.status === 'staging').length, className: 'accent', icon: Upload },
        ].map((s) => (
          <div className="kpi-card" key={s.label}>
            <div className="kpi-card-header">
              <span className="kpi-card-label">{s.label}</span>
              <div className={`kpi-card-icon ${s.className}`}><s.icon /></div>
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
                <span className="filter-chip-count">{f.value === 'all' ? all.length : all.filter((m) => m.status === f.value).length}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto', background: 'var(--fg)', color: 'var(--bg)' }} onClick={() => setPanelOpen(true)}><Plus /> Novo modelo</button>
          </div>
        </div>

        <div className="widget-body">
          {isLoading && <LoadingSpinner />}
          {error && <ErrorState message={error} onRetry={refetch} />}
          {!isLoading && !error && filtered.length === 0 && (
            <div className="empty-state" style={{ padding: 48 }}>
              <Brain size={32} />
              <div className="empty-state-text">Nenhum modelo de IA cadastrado</div>
            </div>
          )}
          {!isLoading && !error && filtered.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
              {filtered.map((m) => {
                const status = STATUS_MAP[m.status] ?? STATUS_MAP.staging
                return (
                  <div key={m.id} className="widget" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{m.name}</div>
                        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>{m.uuid?.slice(0, 8)}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--radius-sm)', background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 16, marginBottom: 14, fontSize: 12, color: 'var(--fg-secondary)' }}>
                      <span>{m.type}</span>
                      <span>{m.framework}</span>
                      <span>{m.size ?? '—'}</span>
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
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>{m.device ?? 'Dispositivo não definido'}</span>
                      <div className="alarm-actions">
                        {m.status !== 'deployed' && (
                          <button className="alarm-action-btn" onClick={() => handleDeploy(m)} title="Implantar" style={{ color: 'var(--success)' }}><Rocket /></button>
                        )}
                        <button className="alarm-action-btn" onClick={() => handleDelete(m)} title="Excluir" style={{ color: 'var(--danger)' }}><Trash2 /></button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {panelOpen && (
        <div className="detail-overlay" onClick={() => setPanelOpen(false)}>
          <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header">
              <h3>Novo modelo de IA</h3>
              <button onClick={() => setPanelOpen(false)} aria-label="Fechar"><X /></button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="login-label" htmlFor="ai-name">Nome do modelo</label>
                <div className="login-input-wrap">
                  <input id="ai-name" className="login-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Anomaly Detector v2" />
                </div>
              </div>
              <div>
                <label className="login-label" htmlFor="ai-type">Tipo</label>
                <select id="ai-type" className="login-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ width: '100%' }}>
                  <option value="anomaly">Anomalia</option>
                  <option value="prediction">Predição</option>
                  <option value="classification">Classificação</option>
                </select>
              </div>
              <div>
                <label className="login-label" htmlFor="ai-framework">Framework</label>
                <div className="login-input-wrap">
                  <input id="ai-framework" className="login-input" value={form.framework} onChange={(e) => setForm({ ...form, framework: e.target.value })} placeholder="TinyML" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Acurácia', key: 'accuracy' as const },
                  { label: 'Latência (ms)', key: 'latency' as const },
                  { label: 'F1 Score', key: 'f1' as const },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="login-label">{f.label}</label>
                    <div className="login-input-wrap">
                      <input className="login-input" type="number" step="0.01" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: Number(e.target.value) })} />
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="login-label" htmlFor="ai-device">Dispositivo alvo</label>
                <div className="login-input-wrap">
                  <input id="ai-device" className="login-input" value={form.device ?? ''} onChange={(e) => setForm({ ...form, device: e.target.value })} placeholder="ESP32-S3" />
                </div>
              </div>
              <div>
                <label className="login-label" htmlFor="ai-desc">Descrição</label>
                <div className="login-input-wrap">
                  <input id="ai-desc" className="login-input" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detecção de anomalias em motores" />
                </div>
              </div>
              <button className="widget-action-btn" onClick={handleCreate} disabled={saving} style={{ padding: '8px 18px', width: '100%', justifyContent: 'center', background: 'var(--fg)', color: 'var(--bg)' }}>
                {saving ? 'Salvando...' : <><Check size={16} /> Criar modelo</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast" style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--fg)', color: 'var(--bg)', padding: '10px 18px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500, boxShadow: 'var(--shadow-md)', zIndex: 200 }}><Check size={16} /> {toast}</div>}
    </>
  )
}
