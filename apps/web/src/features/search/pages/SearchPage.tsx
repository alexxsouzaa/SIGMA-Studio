import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'

interface ResultItem {
  id: string
  title: string
  desc: string
  category: string
  categoryLabel: string
  tags: string[]
  metaInfo: string
  icon: string
  time?: string
}

const ALL_RESULTS: ResultItem[] = [
  { id: 'DEV-001', title: 'Bomba Centrífuga #BC-001', desc: 'Bomba centrífuga principal da Linha 3 — Motor 50HP Weg W22', category: 'devices', categoryLabel: 'Dispositivos', tags: ['Online', 'Planta A'], metaInfo: 'Modbus RTU · GW-Modbus-01', icon: 'cpu' },
  { id: 'DEV-012', title: 'Bomba de Vácuo #BV-012', desc: 'Bomba de vácuo da Linha 1 — Sistema de vácuo central', category: 'devices', categoryLabel: 'Dispositivos', tags: ['Em manutenção', 'Planta B'], metaInfo: 'OPC-UA · GW-OPC-01', icon: 'cpu' },
  { id: 'ALM-014', title: 'ALM-014 — Alta vibração na bomba BC-001', desc: 'Vibração atingiu 14.2mm/s, ultrapassando o limite de segurança de 10mm/s.', category: 'alarms', categoryLabel: 'Alarmes', tags: ['Crítico'], metaInfo: 'Há 12 min · DEV-001', icon: 'bell-ring' },
  { id: 'ALM-019', title: 'ALM-019 — Falta de fluxo na bomba BV-012', desc: 'Sensor de vazão reportando 0 L/min na válvula de saída da bomba de vácuo.', category: 'alarms', categoryLabel: 'Alarmes', tags: ['Médio'], metaInfo: 'Há 3 horas · DEV-012', icon: 'bell-ring' },
  { id: 'GW-PlantaA', title: 'GW-PlantaA — Gateway Modbus', desc: 'Gateway principal da Planta A conectando 612 dispositivos via Modbus TCP e RTU.', category: 'gateways', categoryLabel: 'Gateways', tags: ['Online'], metaInfo: '248 msg/s · Uptime 45d 12h', icon: 'router' },
  { id: 'LOG-0042', title: 'Log [WARN] — Bomba BC-001 temperatura elevada', desc: 'Warning: Temperatura do motor da Bomba BC-001 atingiu 78°C, próximo do limite de 80°C.', category: 'logs', categoryLabel: 'Logs', tags: ['Warning'], metaInfo: 'Há 8 min · DEV-001', icon: 'scroll-text' },
  { id: 'TM-001', title: 'Predição de Falhas em Bombas — TFLite v3.2', desc: 'Modelo TinyML treinado para detectar padrões de falha em bombas centrífugas.', category: 'ia', categoryLabel: 'IA / TinyML', tags: ['Produção', 'TFLite'], metaInfo: '8 dispositivos · 94.2% acurácia', icon: 'brain-circuit' },
]

const CATEGORY_FILTERS = [
  { label: 'Todos', value: 'all', count: ALL_RESULTS.length },
  { label: 'Dispositivos', value: 'devices', count: ALL_RESULTS.filter((r) => r.category === 'devices').length },
  { label: 'Alarmes', value: 'alarms', count: ALL_RESULTS.filter((r) => r.category === 'alarms').length },
  { label: 'Gateways', value: 'gateways', count: ALL_RESULTS.filter((r) => r.category === 'gateways').length },
  { label: 'Logs', value: 'logs', count: ALL_RESULTS.filter((r) => r.category === 'logs').length },
  { label: 'IA', value: 'ia', count: ALL_RESULTS.filter((r) => r.category === 'ia').length },
]

function highlightText(text: string, query: string) {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} style={{ background: 'var(--highlight-bg)', color: 'var(--highlight-fg)', borderRadius: 2, padding: '0 2px' }}>{part}</mark> : part,
  )
}

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [filter, setFilter] = useState('all')

  const results = useMemo(() => {
    let filtered = filter === 'all' ? ALL_RESULTS : ALL_RESULTS.filter((r) => r.category === filter)
    if (query.trim()) {
      const q = query.toLowerCase()
      filtered = filtered.filter((r) => r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
    }
    return filtered
  }, [query, filter])

  const grouped = useMemo(() => {
    const groups: Record<string, ResultItem[]> = {}
    results.forEach((r) => {
      if (!groups[r.category]) groups[r.category] = []
      groups[r.category].push(r)
    })
    return groups
  }, [results])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Search size={20} style={{ color: 'var(--fg-secondary)' }} />
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Busca</h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>
          {query ? (
            <>
              Encontrados <strong style={{ color: 'var(--fg)' }}>{results.length}</strong> resultados para &#39;<strong style={{ color: 'var(--fg)' }}>{query}</strong>&#39;
            </>
          ) : (
            'Digite um termo na barra de busca para pesquisar'
          )}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.value}
            className={`filter-chip${filter === f.value ? ' active' : ''}`}
            onClick={() => setFilter(f.value)}
            style={{ borderRadius: 20 }}
          >
            {f.label}
            <span className="filter-chip-count">{f.count}</span>
          </button>
        ))}
      </div>

      {Object.entries(grouped).length === 0 ? (
        <div className="empty-state">
          <Search size={32} />
          <div className="empty-state-text">Nenhum resultado encontrado</div>
        </div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="widget">
            <div className="widget-header">
              <div className="widget-title" style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}>
                {items[0]?.categoryLabel ?? category}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{items.length}</span>
              </div>
            </div>
            <div className="widget-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="device-card"
                  style={{ padding: '14px 16px', cursor: 'pointer' }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Search size={18} style={{ color: 'var(--fg-secondary)' }} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                      {query ? highlightText(item.title, query) : item.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--fg-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {query ? highlightText(item.desc, query) : item.desc}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                      {item.tags.map((tag) => (
                        <span key={tag} style={{
                          fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 'var(--radius-sm)',
                          background: tag === 'Online' ? 'var(--success-muted)' : tag === 'Crítico' ? 'var(--danger-muted)' : tag === 'Warning' ? 'var(--warning-muted)' : 'var(--surface-hover)',
                          color: tag === 'Online' ? 'var(--success)' : tag === 'Crítico' ? 'var(--danger)' : tag === 'Warning' ? 'var(--warning)' : 'var(--fg-muted)',
                        }}>
                          {tag}
                        </span>
                      ))}
                      <span style={{ fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>{item.metaInfo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
