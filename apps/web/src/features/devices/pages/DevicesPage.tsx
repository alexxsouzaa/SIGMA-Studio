import { useState, useMemo } from 'react'
import {
  Plus,
  Upload,
  LayoutGrid,
  List,
  Search,
  X,
  Edit,
  RotateCcw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Wifi,
  Cable,
} from 'lucide-react'
import { useDevices, LoadingSpinner, ErrorState, EmptyState } from '@/lib/hooks'
import type { Device } from '@/types/device'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  online: { label: 'Online', className: 'online' },
  offline: { label: 'Offline', className: 'offline' },
  warning: { label: 'Alerta', className: 'warning' },
}

function deviceStatus(d: Device): 'online' | 'offline' {
  return d.active ? 'online' : 'offline'
}

export default function DevicesPage() {
  const { data: devices, isLoading, error, refetch } = useDevices()
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  const FILTERS = useMemo(() => {
    const list = devices ?? []
    const online = list.filter((d) => d.active).length
    const offline = list.filter((d) => !d.active).length
    return [
      { label: 'Todos', value: 'all', count: list.length },
      { label: 'Online', value: 'online', count: online },
      { label: 'Alerta', value: 'warning', count: 0 },
      { label: 'Offline', value: 'offline', count: offline },
    ]
  }, [devices])

  const STATS = useMemo(() => {
    const list = devices ?? []
    const online = list.filter((d) => d.active).length
    const offline = list.filter((d) => !d.active).length
    return [
      { label: 'Total', value: list.length, icon: Cpu, className: 'accent' },
      { label: 'Online', value: online, icon: Wifi, className: 'success' },
      { label: 'Offline', value: offline, icon: Cable, className: 'danger' },
      { label: 'Com alertas', value: 0, icon: Search, className: 'info' },
    ]
  }, [devices])

  const filtered = useMemo(() => {
    const list = devices ?? []
    return list.filter((d) => {
      switch (filter) {
        case 'online': return d.active
        case 'offline': return !d.active
        case 'warning': return false
        default: return true
      }
    })
  }, [devices, filter])

  if (isLoading) return <LoadingSpinner />

  if (error) return <ErrorState message={error} onRetry={refetch} />

  if (!devices || devices.length === 0) {
    return (
      <EmptyState
        icon={<Cpu />}
        title="Nenhum dispositivo encontrado"
        description="Cadastre seu primeiro dispositivo para começar a monitorar."
      />
    )
  }

  return (
    <>
      <div className="kpi-grid">
        {STATS.map((s) => (
          <div className="kpi-card" key={s.label}>
            <div className="kpi-card-header">
              <span className="kpi-card-label">{s.label}</span>
              <div className={`kpi-card-icon ${s.className}`}>
                <s.icon />
              </div>
            </div>
            <div className="kpi-card-value">{s.value.toLocaleString('pt-BR')}</div>
          </div>
        ))}
      </div>

      <div className="widget">
        <div className="widget-header" style={{ flexWrap: 'wrap', gap: 8 }}>
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
            <button
              className={`widget-action-btn${viewMode === 'grid' ? '' : ''}`}
              onClick={() => setViewMode('grid')}
              style={{ background: viewMode === 'grid' ? 'var(--surface-hover)' : '' }}
            >
              <LayoutGrid />
            </button>
            <button
              className="widget-action-btn"
              onClick={() => setViewMode('list')}
              style={{ background: viewMode === 'list' ? 'var(--surface-hover)' : '' }}
            >
              <List />
            </button>
            <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto' }}>
              <Upload /> Importar
            </button>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto', background: 'var(--fg)', color: 'var(--bg)' }}>
              <Plus /> Adicionar
            </button>
          </div>
        </div>

        <div className="widget-body">
          {viewMode === 'grid' ? (
            <div className="device-grid">
              {filtered.map((d) => {
                const status = deviceStatus(d)
                return (
                  <div key={d.id} className="device-card" onClick={() => setSelectedDevice(d)} style={{ cursor: 'pointer' }}>
                    <div className={`device-card-indicator ${status}`} />
                    <div className="device-card-info">
                      <div className="device-card-name">{d.name}</div>
                      <div className="device-card-meta">{d.serial_number} · {d.location ?? '—'}</div>
                    </div>
                    <div className="device-card-value">{d.firmware_version}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="alarms-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Dispositivo</th>
                    <th>Firmware</th>
                    <th>Status</th>
                    <th>Localização</th>
                    <th>Atualizado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => {
                    const status = deviceStatus(d)
                    return (
                      <tr key={d.id} onClick={() => setSelectedDevice(d)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{d.name}</div>
                          <div className="alarm-device">{d.serial_number}</div>
                        </td>
                        <td>{d.firmware_version}</td>
                        <td>
                          <span className={`alarm-severity ${status === 'online' ? 'low' : 'critical'}`}>
                            <span className="alarm-severity-dot" />{STATUS_LABELS[status]?.label}
                          </span>
                        </td>
                        <td>{d.location ?? '—'}</td>
                        <td className="alarm-time">
                          {new Date(d.updated_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td>
                          <div className="alarm-actions">
                            <button className="alarm-action-btn"><Edit /></button>
                            <button className="alarm-action-btn"><RotateCcw /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <span className="alarm-time" style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
          Mostrando {filtered.length} de {devices.length} dispositivos
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="widget-action-btn" disabled><ChevronLeft /></button>
          <button className="widget-action-btn" style={{ width: 'auto', padding: '0 8px', minWidth: 32, background: 'var(--surface-hover)' }}>1</button>
          <button className="widget-action-btn" style={{ width: 'auto', padding: '0 8px', minWidth: 32 }}>2</button>
          <button className="widget-action-btn" style={{ width: 'auto', padding: '0 8px', minWidth: 32 }}>3</button>
          <button className="widget-action-btn"><ChevronRight /></button>
        </div>
      </div>

      {selectedDevice && (
        <>
          <div className="detail-overlay" onClick={() => setSelectedDevice(null)} />
          <div className="detail-panel open">
            <div className="detail-header">
              <h3>{selectedDevice.name}</h3>
              <button onClick={() => setSelectedDevice(null)}><X /></button>
            </div>
            <div className="detail-body">
              <div className="detail-section">
                <div className="detail-section-title">Informações Gerais</div>
                <div className="detail-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    ['Nome', selectedDevice.name],
                    ['Serial', selectedDevice.serial_number],
                    ['Firmware', selectedDevice.firmware_version],
                    ['Status', STATUS_LABELS[deviceStatus(selectedDevice)]?.label],
                    ['Localização', selectedDevice.location ?? '—'],
                    ['Criado em', new Date(selectedDevice.created_at).toLocaleDateString('pt-BR')],
                    ['Atualizado em', new Date(selectedDevice.updated_at).toLocaleDateString('pt-BR')],
                  ].map(([label, value]) => (
                    <div key={label} className="detail-info-item">
                      <div style={{ fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="detail-actions">
                <button className="widget-action-btn" style={{ flex: 1, padding: '8px', width: 'auto' }}><Edit /> Editar</button>
                <button className="widget-action-btn" style={{ flex: 1, padding: '8px', width: 'auto', color: 'var(--danger)' }}><RotateCcw /> Reiniciar</button>
                <button className="widget-action-btn" style={{ flex: 1, padding: '8px', width: 'auto', color: 'var(--danger)' }}><Trash2 /> Remover</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
