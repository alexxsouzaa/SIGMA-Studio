import { useState, useMemo, useEffect } from 'react'
import { Plus, Upload, LayoutGrid, List, X, RotateCcw, Trash2, ChevronLeft, ChevronRight, Cpu, CheckCircle2, XCircle, AlertTriangle, Thermometer, Router, Pencil, HardDrive, Zap, Search, SearchX } from 'lucide-react'
import { useApi } from '@/lib/hooks'
import { LoadingSpinner, ErrorState } from '@/components/shared/StatusStates'
import type { Device } from '@/types/device'

interface Alert {
  id: number; device_id: number; alarm_type: string; level: string
  value: number | null; threshold: number | null; acknowledged: boolean; created_at: string
}

const PAGE_SIZE = 20

const FILTERS = [
  { label: 'Todos', value: 'all', color: '' },
  { label: 'Online', value: 'online', color: 'var(--success)' },
  { label: 'Offline', value: 'offline', color: 'var(--danger)' },
  { label: 'Alerta', value: 'warning', color: 'var(--warning)' },
]

function deviceType(d: Device): string {
  const n = d.name.toLowerCase()
  if (n.includes('sensor')) return 'Sensor'
  if (n.includes('gateway')) return 'Gateway'
  if (n.includes('plc') || n.includes('controladora')) return 'Controladora'
  if (n.includes('hmi') || n.includes('painel') || n.includes('panel')) return 'IHM'
  if (n.includes('bomba') || n.includes('motor') || n.includes('atuador') || n.includes('rtu')) return 'Atuador'
  if (n.includes('drive') || n.includes('freq')) return 'Drive'
  return 'Dispositivo'
}

function typeIcon(name: string) {
  const n = name.toLowerCase()
  if (n.includes('sensor') || n.includes('temp') || n.includes('nivel') || n.includes('gas') || n.includes('umid') || n.includes('vib')) return Thermometer
  if (n.includes('gateway') || n.includes('router') || n.includes('opc')) return Router
  if (n.includes('plc') || n.includes('controladora') || n.includes('cpu')) return Cpu
  if (n.includes('drive') || n.includes('freq') || n.includes('motor') || n.includes('bomba')) return Zap
  if (n.includes('hmi') || n.includes('painel') || n.includes('panel')) return HardDrive
  return Cpu
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Agora'
  if (mins < 60) return `${mins} min atras`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} h atras`
  const days = Math.floor(hours / 24)
  return `${days} dias atras`
}

function getPageNumbers(page: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const pages: (number | 'ellipsis')[] = [1]
  if (page > 3) pages.push('ellipsis' as const)
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
    pages.push(i)
  }
  if (page < totalPages - 2) pages.push('ellipsis' as const)
  pages.push(totalPages)
  return pages
}

function statusLabel(s: string) {
  if (s === 'online') return 'Online'
  if (s === 'offline') return 'Offline'
  return 'Alerta'
}

export default function DevicesPage() {
  const { data: devices, isLoading, error, refetch } = useApi<Device[]>('/devices/?limit=500')
  const { data: alerts } = useApi<Alert[]>('/alerts/?limit=500')

  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const alertDeviceIds = useMemo(() => {
    if (!alerts) return new Set<number>()
    return new Set(alerts.filter((a) => !a.acknowledged).map((a) => a.device_id))
  }, [alerts])

  function deviceStatus(d: Device): 'online' | 'offline' | 'warning' {
    if (alertDeviceIds.has(d.id)) return 'warning'
    return d.active ? 'online' : 'offline'
  }

  const onlineCount = useMemo(() => {
    if (!devices) return 0
    return devices.filter((d) => d.active && !alertDeviceIds.has(d.id)).length
  }, [devices, alertDeviceIds])

  const offlineCount = useMemo(() => {
    if (!devices) return 0
    return devices.filter((d) => !d.active && !alertDeviceIds.has(d.id)).length
  }, [devices, alertDeviceIds])

  const alertCount = useMemo(() => alertDeviceIds.size, [alertDeviceIds])

  const total = useMemo(() => (devices ?? []).length, [devices])

  const filtered = useMemo(() => {
    let result = devices ?? []
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((d) =>
        d.name.toLowerCase().includes(q) ||
        d.serial_number.toLowerCase().includes(q) ||
        (d.location ?? '').toLowerCase().includes(q) ||
        deviceType(d).toLowerCase().includes(q)
      )
    }
    if (filter === 'online') result = result.filter((d) => d.active && !alertDeviceIds.has(d.id))
    else if (filter === 'offline') result = result.filter((d) => !d.active && !alertDeviceIds.has(d.id))
    else if (filter === 'warning') result = result.filter((d) => alertDeviceIds.has(d.id))
    return result
  }, [devices, filter, search, alertDeviceIds])

  useEffect(() => { setPage(1) }, [filter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const paginatedDevices = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  const showingStart = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const showingEnd = Math.min(page * PAGE_SIZE, filtered.length)

  const telemetryData = useMemo(() => {
    if (!selectedDevice) return []
    const seed = selectedDevice.id * 137
    const rng = (s: number) => { const x = Math.sin(s) * 10000; return x - Math.floor(x) }
    return Array.from({ length: 40 }, (_, i) => {
      const wave = Math.sin(i * 0.4 + seed) * 8
      const noise = (rng(seed + i) - 0.5) * 4
      return Math.round((25 + wave + noise) * 10) / 10
    })
  }, [selectedDevice])

  function telemetryPts(data: number[]) {
    const min = Math.min(...data); const max = Math.max(...data); const range = max - min || 1
    return data.map((v, i) => `${i * 10},${55 - ((v - min) / range) * 50}`).join(' ')
  }

  useEffect(() => {
    if (isLoading) return
    const elements = document.querySelectorAll<HTMLElement>('.r')
    if (!elements.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((el) => { el.classList.add('v'); el.style.opacity = '1'; el.style.transform = 'none' })
      return
    }
    let idx = 0
    const delay = viewMode === 'grid' ? 40 : 30
    const timer = setInterval(() => {
      if (idx < elements.length) {
        elements[idx].classList.add('v')
        idx++
      } else {
        clearInterval(timer)
      }
    }, delay)
    return () => clearInterval(timer)
  }, [paginatedDevices, viewMode, isLoading])

  useEffect(() => {
    if (selectedDevice) {
      document.body.classList.add('panel-open')
      return () => { document.body.classList.remove('panel-open') }
    }
  }, [selectedDevice])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && selectedDevice) {
        setSelectedDevice(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedDevice])

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <>
      <div className="device-stats">
        {[
          { label: 'Total de dispositivos', value: total, icon: Cpu, cls: 'total' },
          { label: 'Online', value: onlineCount, icon: CheckCircle2, cls: 'online' },
          { label: 'Offline', value: offlineCount, icon: XCircle, cls: 'offline' },
          { label: 'Com alertas', value: alertCount, icon: AlertTriangle, cls: 'alert' },
        ].map((s) => (
          <div key={s.label} className="device-stat r">
            <div className={`device-stat-icon ${s.cls}`}><s.icon /></div>
            <div><div className="device-stat-value">{s.value.toLocaleString('pt-BR')}</div><div className="device-stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="device-toolbar">
        <div className="device-search-wrap">
          <Search />
          <input
            type="text"
            placeholder="Buscar dispositivo..."
            aria-label="Buscar dispositivo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <kbd>/</kbd>
        </div>
        <div className="device-filters">
          {FILTERS.map((f) => {
            const count = f.value === 'all' ? total
              : f.value === 'online' ? onlineCount
              : f.value === 'offline' ? offlineCount
              : alertCount
            return (
              <button
                key={f.value}
                className={`filter-chip${filter === f.value ? ' active' : ''}`}
                onClick={() => setFilter(f.value)}
                aria-pressed={filter === f.value}
              >
                {f.value !== 'all' && <span className="filter-chip-dot" style={{ background: f.color }} />}
                {f.label} <span className="filter-chip-count">{count}</span>
              </button>
            )
          })}
        </div>
        <div className="device-actions">
          <div className="view-toggle">
            <button className={`view-toggle-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')} aria-label="Visualizacao em grade"><LayoutGrid /></button>
            <button className={`view-toggle-btn${viewMode === 'list' ? ' active' : ''}`} onClick={() => setViewMode('list')} aria-label="Visualizacao em lista"><List /></button>
          </div>
          <button className="btn-ghost"><Upload /> Importar</button>
          <button className="btn-primary"><Plus /> Adicionar</button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        filtered.length === 0 ? (
          <div className="device-empty">
            <div className="device-empty-icon"><SearchX /></div>
            <div className="device-empty-title">Nenhum dispositivo encontrado</div>
            <div className="device-empty-desc">Tente ajustar os filtros ou o termo de busca para encontrar o que procura.</div>
          </div>
        ) : (
          <div className="device-grid-page">
            {paginatedDevices.map((d, i) => {
              const status = deviceStatus(d)
              const Icon = typeIcon(d.name)
              const type = deviceType(d)
              return (
                <div
                  key={d.id}
                  className="device-card r"
                  style={{ transitionDelay: `${Math.min(i * 40, 400)}ms` }}
                  onClick={() => setSelectedDevice(d)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Ver detalhes de ${d.name}`}
                >
                  <div className="device-card-header">
                    <div className="device-card-icon"><Icon /></div>
                    <span className={`device-card-status ${status}`}>
                      <span className="device-card-status-dot" />
                      {statusLabel(status)}
                    </span>
                  </div>
                  <div className="device-card-name">{d.name}</div>
                  <div className="device-card-type">{type} — {d.serial_number}</div>
                  <div className="device-card-meta">
                    <div className="device-card-row"><span className="device-card-row-label">Localizacao</span><span className="device-card-row-value">{d.location || '---'}</span></div>
                    <div className="device-card-row"><span className="device-card-row-label">Protocolo</span><span className="device-card-row-value">---</span></div>
                    <div className="device-card-row"><span className="device-card-row-label">Ultima leitura</span><span className="device-card-row-value">{timeAgo(d.updated_at)}</span></div>
                    <div className="device-card-row"><span className="device-card-row-label">Uptime</span><span className="device-card-row-value">---</span></div>
                  </div>
                  <div className="device-card-tags">
                    <span className="device-tag">{type}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        filtered.length === 0 ? (
          <div className="device-table-wrap">
            <table className="device-table">
              <thead><tr><th>Dispositivo</th><th>Tipo</th><th>Status</th><th>Gateway</th><th>Ultima Leitura</th><th>Tags</th></tr></thead>
              <tbody>
                <tr><td colSpan={6}>
                  <div className="device-empty">
                    <div className="device-empty-icon"><SearchX /></div>
                    <div className="device-empty-title">Nenhum dispositivo encontrado</div>
                    <div className="device-empty-desc">Tente ajustar os filtros ou o termo de busca.</div>
                  </div>
                </td></tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="device-table-wrap">
            <table className="device-table">
              <thead><tr><th>Dispositivo</th><th>Tipo</th><th>Status</th><th>Gateway</th><th>Ultima Leitura</th><th>Tags</th></tr></thead>
              <tbody>
                {paginatedDevices.map((d, i) => {
                  const status = deviceStatus(d)
                  const Icon = typeIcon(d.name)
                  const type = deviceType(d)
                  return (
                    <tr
                      key={d.id}
                      className="r"
                      style={{ transitionDelay: `${Math.min(i * 30, 300)}ms` }}
                      onClick={() => setSelectedDevice(d)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Ver detalhes de ${d.name}`}
                    >
                      <td><div className="td-name"><div className="td-icon"><Icon /></div><span className="td-name-text">{d.name}</span></div></td>
                      <td>{type}</td>
                      <td><span className={`device-card-status ${status}`}><span className="device-card-status-dot" />{statusLabel(status)}</span></td>
                      <td className="td-mono">---</td>
                      <td>{timeAgo(d.updated_at)}</td>
                      <td><span className="device-tag">{type}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      <div className="device-pagination">
        <span className="device-pagination-info" aria-live="polite">
          {filtered.length === 0
            ? 'Nenhum dispositivo encontrado'
            : `Mostrando ${showingStart}–${showingEnd} de ${filtered.length} dispositivos`}
        </span>
        <div className="device-pagination-btns">
          <button className="device-pagination-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Pagina anterior"><ChevronLeft /></button>
          {getPageNumbers(page, totalPages).map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`e-${i}`} className="device-pagination-btn" style={{ border: 'none', cursor: 'default' }}>...</span>
            ) : (
              <button
                key={p}
                className={`device-pagination-btn${p === page ? ' active' : ''}`}
                onClick={() => setPage(p)}
                aria-label={`Pagina ${p}`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            )
          )}
          <button className="device-pagination-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} aria-label="Proxima pagina"><ChevronRight /></button>
        </div>
      </div>

      {selectedDevice && (
        <>
          <div
            className="detail-overlay open"
            onClick={() => setSelectedDevice(null)}
          />
          <aside
            className="detail-panel open"
            role="dialog"
            aria-label="Detalhes do dispositivo"
            aria-modal="true"
          >
            <div className="detail-header">
              <span className="detail-header-title">{selectedDevice.name}</span>
              <button className="detail-close" onClick={() => setSelectedDevice(null)} aria-label="Fechar detalhes"><X /></button>
            </div>
            <div className="detail-body">
              <div className="detail-section">
                <div className="detail-section-title">Informacoes Gerais</div>
                <div className="detail-info-grid">
                  {[
                    ['ID', selectedDevice.serial_number, true],
                    ['Modelo', selectedDevice.serial_number, false],
                    ['Tipo', deviceType(selectedDevice), false],
                    ['Status', statusLabel(deviceStatus(selectedDevice)), false],
                    ['Localizacao', selectedDevice.location || '---', false],
                    ['Gateway', '---', true],
                    ['IP', '---', true],
                    ['MAC', '---', true],
                    ['Protocolo', '---', false],
                    ['Ultima leitura', timeAgo(selectedDevice.updated_at), false],
                    ['Uptime', '---', true],
                    ['Temperatura', telemetryData.length > 0 ? `${telemetryData[telemetryData.length - 1]}°C` : '---', true],
                  ].map(([label, value, mono]) => (
                    <div key={label as string} className="detail-info-item">
                      <span className="detail-info-label">{label as string}</span>
                      <span className={`detail-info-value${mono ? ' mono' : ''}`}>
                        {label === 'Status' ? (
                          <span className={`device-card-status ${deviceStatus(selectedDevice)}`}>
                            <span className="device-card-status-dot" />
                            {value as string}
                          </span>
                        ) : (value as string)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="detail-divider" />
              <div className="detail-section">
                <div className="detail-section-title">Telemetria Recente</div>
                <div className="detail-telemetry">
                  <div className="detail-telemetry-header">
                    <span className="detail-telemetry-title">Temperatura (24h)</span>
                    <span className="detail-telemetry-value">{telemetryData[telemetryData.length - 1] ?? '---'}°C</span>
                  </div>
                  <div className="detail-telemetry-chart">
                    <svg viewBox="0 0 400 60" preserveAspectRatio="none" role="img" aria-label="Grafico de telemetria">
                      <polyline points={telemetryPts(telemetryData)} fill="none" stroke="var(--info)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="detail-divider" />
              <div className="detail-section">
                <div className="detail-section-title">Configuracao</div>
                <div className="detail-info-grid">
                  {[
                    ['Firmware', selectedDevice.firmware_version, true],
                    ['Intervalo de coleta', '5s', false],
                    ['Retencao de dados', '30 dias', false],
                    ['Alertas habilitados', 'Sim', false],
                  ].map(([label, value, mono]) => (
                    <div key={label as string} className="detail-info-item">
                      <span className="detail-info-label">{label as string}</span>
                      <span className={`detail-info-value${mono ? ' mono' : ''}`}>{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn-ghost"><Pencil /> Editar</button>
              <button className="btn-primary"><RotateCcw /> Reiniciar</button>
              <button className="btn-danger"><Trash2 /> Remover</button>
            </div>
          </aside>
        </>
      )}
    </>
  )
}
