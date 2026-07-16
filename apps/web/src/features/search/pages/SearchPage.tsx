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

// TODO: connect to GET /api/v1/search when endpoint exists
const ALL_RESULTS: ResultItem[] = []

const CATEGORY_FILTERS = [
  { label: 'Todos', value: 'all', count: 0 },
  { label: 'Dispositivos', value: 'devices', count: 0 },
  { label: 'Alarmes', value: 'alarms', count: 0 },
  { label: 'Gateways', value: 'gateways', count: 0 },
  { label: 'Logs', value: 'logs', count: 0 },
  { label: 'IA', value: 'ia', count: 0 },
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

  const hasQuery = query.trim().length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Search size={20} style={{ color: 'var(--fg-secondary)' }} />
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Busca</h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>
          {hasQuery ? (
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

      {!hasQuery ? (
        <div className="empty-state" style={{ padding: 48 }}>
          <Search size={32} />
          <div className="empty-state-text">Digite um termo na barra de busca</div>
        </div>
      ) : Object.entries(grouped).length === 0 ? (
        <div className="empty-state" style={{ padding: 48 }}>
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
                      {hasQuery ? highlightText(item.title, query) : item.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--fg-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {hasQuery ? highlightText(item.desc, query) : item.desc}
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
