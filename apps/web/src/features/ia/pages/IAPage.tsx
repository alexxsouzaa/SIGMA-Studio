import { useState } from 'react'
import { Brain, Upload, Plus, Eye, Download, MoreVertical } from 'lucide-react'

const ALL_MODELS = [
  { id: 'TM-001', name: 'Predição de Falhas em Bombas', status: 'deployed', type: 'TinyML', framework: 'TensorFlow Lite', accuracy: 94.2, latency: 12, f1: 0.91, device: 'ESP32-S3 · BC-001', size: '48 KB', date: '2026-06-15' },
  { id: 'TM-002', name: 'Detecção de Anomalia de Vibração', status: 'deployed', type: 'TinyML', framework: 'TensorFlow Lite', accuracy: 91.7, latency: 8, f1: 0.88, device: 'STM32L4 · VC-042', size: '32 KB', date: '2026-05-28' },
  { id: 'TM-003', name: 'Classificação de Temperatura', status: 'deployed', type: 'ONNX', framework: 'ONNX Runtime', accuracy: 89.4, latency: 15, f1: 0.85, device: 'ARM M7 · TC-128', size: '24 KB', date: '2026-06-02' },
  { id: 'TM-004', name: 'Previsão de Pressão Hidráulica', status: 'deployed', type: 'TinyML', framework: 'TensorFlow Lite', accuracy: 96.1, latency: 6, f1: 0.93, device: 'RP2040 · PH-007', size: '36 KB', date: '2026-07-01' },
  { id: 'TM-005', name: 'Otimização de Consumo Energético', status: 'training', type: 'PyTorch', framework: 'PyTorch Edge', accuracy: 87.8, latency: 20, f1: 0.82, device: 'ESP32 · Zona B', size: '62 KB', date: '2026-07-10' },
  { id: 'TM-006', name: 'Segmentação de Fluxo', status: 'staging', type: 'ONNX', framework: 'ONNX Runtime', accuracy: 92.3, latency: 10, f1: 0.89, device: 'STM32H7 · FL-003', size: '28 KB', date: '2026-07-08' },
  { id: 'TM-007', name: 'Classificação de Falhas Elétricas', status: 'deployed', type: 'TinyML', framework: 'TensorFlow Lite', accuracy: 90.5, latency: 14, f1: 0.87, device: 'ESP32-S3 · FE-012', size: '44 KB', date: '2026-04-20' },
  { id: 'TM-008', name: 'Detecção de Cavitação', status: 'archived', type: 'PyTorch', framework: 'PyTorch Edge', accuracy: 78.2, latency: 25, f1: 0.71, device: 'ARM M7 · CV-001', size: '56 KB', date: '2026-02-14' },
]

const FILTERS = [
  { label: 'Todos', value: 'all', count: ALL_MODELS.length },
  { label: 'Em produção', value: 'deployed', count: ALL_MODELS.filter((m) => m.status === 'deployed').length },
  { label: 'Em treinamento', value: 'training', count: ALL_MODELS.filter((m) => m.status === 'training').length },
  { label: 'Staging', value: 'staging', count: ALL_MODELS.filter((m) => m.status === 'staging').length },
  { label: 'Arquivados', value: 'archived', count: ALL_MODELS.filter((m) => m.status === 'archived').length },
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
    { label: 'Modelos totais', value: ALL_MODELS.length, className: 'info' },
    { label: 'Em produção', value: ALL_MODELS.filter((m) => m.status === 'deployed').length, className: 'success' },
    { label: 'Em treinamento', value: ALL_MODELS.filter((m) => m.status === 'training').length, className: 'warning' },
    { label: 'Inferências/dia', value: '1.4M', className: 'accent' },
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
                      {status.label}
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
                      <button className="alarm-action-btn"><Eye /></button>
                      <button className="alarm-action-btn"><Download /></button>
                      <button className="alarm-action-btn"><MoreVertical /></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
