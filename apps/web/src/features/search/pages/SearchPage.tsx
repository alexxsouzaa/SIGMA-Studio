import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Cpu, BellRing } from 'lucide-react'
import { useApi } from '@/lib/hooks'
import { LoadingSpinner, ErrorState } from '@/components/shared/StatusStates'

interface ResultItem {
  id: string
  title: string
  desc: string
  category: string
  categoryLabel: string
  tags: string[]
  metaInfo: string
  time?: string
}

const CATEGORY_LABELS: Record<string, string> = {
  devices: 'Dispositivos',
  alarms: 'Alarmes',
  gateways: 'Gateways',
  logs: 'Logs',
  ia: 'IA',
}

const CATEGORY_FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Dispositivos', value: 'devices' },
  { label: 'Alarmes', value: 'alarms' },
  { label: 'Gateways', value: 'gateways' },
  { label: 'Logs', value: 'logs' },
  { label: 'IA', value: 'ia' },
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
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250)
    return () => clearTimeout(t)
  }, [query])

  const hasQuery = debouncedQuery.trim().length > 0

  const endpoint = hasQuery
    ? `/search/?q=${encodeURIComponent(debouncedQuery.trim())}${filter !== 'all' ? `&category=${filter}` : ''}`
    : null

  const { data: results, isLoading, error, refetch } = useApi<ResultItem[]>(endpoint)

  const grouped = useMemo(() => {
    const groups: Record<string, ResultItem[]> = {}
    ;(results ?? []).forEach((r) => {
      const cat = r.category ?? 'other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(r)
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
          {hasQuery ? (
            <>
              Encontrados <strong style={{ color: 'var(--fg)' }}>{results?.length ?? 0}</strong> resultados para &#39;<strong style={{ color: 'var(--fg)' }}>{debouncedQuery}</strong>&#39;
            </>
          ) : (
            'Digite um termo na barra de busca para pesquisar'
          )}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {CATEGORY_FILTERS.map((f) => {
          const count = filter === f.value
            ? (results?.length ?? 0)
            : f.value === 'all'
              ? (results?.length ?? 0)
              : 0
          return (
            <button
              key={f.value}
              className={`filter-chip${filter === f.value ? ' active' : ''}`}
              onClick={() => setFilter(filter === f.value ? 'all' : f.value)}
              style={{ borderRadius: 20 }}
            >
              {f.label}
              <span className="filter-chip-count">{count}</span>
            </button>
          )
        })}
      </div>

      {!hasQuery ? (
        <div className="empty-state" style={{ padding: 48 }}>
          <Search size={32} />
          <div className="empty-state-text">Digite um termo na barra de busca</div>
        </div>
      ) : isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : Object.keys(grouped).length === 0 ? (
        <div className="empty-state" style={{ padding: 48 }}>
          <Search size={32} />
          <div className="empty-state-text">Nenhum resultado encontrado</div>
        </div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="widget">
            <div className="widget-header">
              <div className="widget-title" style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}>
                {CATEGORY_LABELS[category] ?? category}
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
                    {item.category === 'devices' ? <Cpu size={18} style={{ color: 'var(--fg-secondary)' }} /> : <BellRing size={18} style={{ color: 'var(--fg-secondary)' }} />}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                      {hasQuery ? highlightText(item.title, debouncedQuery) : item.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--fg-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {hasQuery ? highlightText(item.desc, debouncedQuery) : item.desc}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                      {item.tags.map((tag) => (
                        <span key={tag} style={{
                          fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 'var(--radius-sm)',
                          background: tag === 'Online' ? 'var(--success-muted)' : tag === 'Offline' ? 'var(--danger-muted)' : tag === 'Crítico' || tag === 'Erro' ? 'var(--danger-muted)' : tag === 'Alto' ? 'var(--warning-muted)' : tag === 'Baixo' ? 'var(--info-muted)' : 'var(--surface-hover)',
                          color: tag === 'Online' ? 'var(--success)' : tag === 'Offline' ? 'var(--danger)' : tag === 'Crítico' || tag === 'Erro' ? 'var(--danger)' : tag === 'Alto' ? 'var(--warning)' : tag === 'Baixo' ? 'var(--info)' : 'var(--fg-muted)',
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
