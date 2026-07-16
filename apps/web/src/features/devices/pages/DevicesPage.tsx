import { useState } from 'react'
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

const ALL_DEVICES = [
  { id: 'DEV-001', name: 'PLC-07 Siemens S7-1500', type: 'Controlador', model: 'S7-1500', status: 'online', protocol: 'Modbus TCP', gateway: 'GW-Modbus-01', location: 'Linha 3 - Painel Principal', firmware: 'v4.2.1', ip: '192.168.1.100', mac: '00:1B:44:11:3A:B7', lastSeen: 'Há 2 min', uptime: '127d 14h', temp: 72.4, tags: ['PLC', 'Siemens', 'Linha 3'] },
  { id: 'DEV-003', name: 'Sensor-T21 ABB CT310', type: 'Sensor', model: 'CT310', status: 'online', protocol: 'MQTT', gateway: 'GW-MQTT-01', location: 'Zona B - Tanque 4', firmware: 'v3.1.0', ip: '192.168.1.42', mac: '00:0C:29:5E:D3:11', lastSeen: 'Há 30s', uptime: '245d 3h', temp: 23.1, tags: ['Sensor', 'ABB', 'Temperatura'] },
  { id: 'DEV-005', name: 'Gateway-M04 Beckhoff', type: 'Gateway', model: 'CX9020', status: 'warning', protocol: 'EtherCAT', gateway: 'GW-ECAT-01', location: 'Rack 2 - Sala de Controle', firmware: 'v2.8.3', ip: '192.168.1.50', mac: '00:30:1A:8F:22:C4', lastSeen: 'Há 5 min', uptime: '30d 8h', temp: 48.5, tags: ['Gateway', 'Beckhoff', 'EtherCAT'] },
  { id: 'DEV-008', name: 'RTU-Festo VTSA', type: 'Atuador', model: 'VTSA-44', status: 'online', protocol: 'OPC-UA', gateway: 'GW-OPC-01', location: 'Linha 1 - Válvulas', firmware: 'v5.0.1', ip: '192.168.1.75', mac: '00:1E:C0:44:7B:38', lastSeen: 'Há 45s', uptime: '89d 22h', temp: 38.2, tags: ['RTU', 'Festo', 'Pneumática'] },
  { id: 'DEV-010', name: 'HMI-Panel Schneider', type: 'IHM', model: 'HMISTU855', status: 'online', protocol: 'Modbus TCP', gateway: 'GW-Modbus-01', location: 'Painel Operador 2', firmware: 'v6.3.0', ip: '192.168.1.200', mac: '00:80:F4:AA:12:D8', lastSeen: 'Há 1 min', uptime: '312d 5h', temp: 41.0, tags: ['HMI', 'Schneider', 'Operação'] },
  { id: 'DEV-012', name: 'Sensor-P12 Phoenix', type: 'Sensor', model: 'RAD-2400', status: 'offline', protocol: 'BLE', gateway: 'GW-BLE-A', location: 'Zona A - Forno', firmware: 'v1.9.0', ip: '—', mac: '00:07:80:33:CC:E1', lastSeen: 'Há 12 min', uptime: '—', temp: 0, tags: ['Sensor', 'Phoenix', 'Temperatura'] },
  { id: 'DEV-015', name: 'Drive-Freq ABB ACS580', type: 'Drive', model: 'ACS580-01', status: 'online', protocol: 'Modbus TCP', gateway: 'GW-Modbus-01', location: 'Linha 2 - Motor Principal', firmware: 'v3.4.2', ip: '192.168.1.155', mac: '00:50:56:C0:00:08', lastSeen: 'Há 15s', uptime: '180d 12h', temp: 54.7, tags: ['Drive', 'ABB', 'Motor'] },
  { id: 'DEV-020', name: 'Sensor-Vib VibroSyst', type: 'Sensor', model: 'VIB10-45', status: 'warning', protocol: 'OPC-UA', gateway: 'GW-OPC-01', location: 'Zona C - Bomba BC-001', firmware: 'v4.1.0', ip: '192.168.1.180', mac: '00:0A:35:01:FE:DC', lastSeen: 'Há 3 min', uptime: '67d 8h', temp: 31.8, tags: ['Sensor', 'Vibração', 'Análise'] },
]

const FILTERS = [
  { label: 'Todos', value: 'all', count: ALL_DEVICES.length },
  { label: 'Online', value: 'online', count: ALL_DEVICES.filter((d) => d.status === 'online').length },
  { label: 'Alerta', value: 'warning', count: ALL_DEVICES.filter((d) => d.status === 'warning').length },
  { label: 'Offline', value: 'offline', count: ALL_DEVICES.filter((d) => d.status === 'offline').length },
]

const STATS = [
  { label: 'Total', value: ALL_DEVICES.length, icon: Cpu, className: 'accent' },
  { label: 'Online', value: ALL_DEVICES.filter((d) => d.status === 'online').length, icon: Wifi, className: 'success' },
  { label: 'Offline', value: ALL_DEVICES.filter((d) => d.status === 'offline').length, icon: Cable, className: 'danger' },
  { label: 'Com alertas', value: ALL_DEVICES.filter((d) => d.status === 'warning').length, icon: Search, className: 'info' },
]

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  online: { label: 'Online', className: 'online' },
  offline: { label: 'Offline', className: 'offline' },
  warning: { label: 'Alerta', className: 'warning' },
}

export default function DevicesPage() {
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedDevice, setSelectedDevice] = useState<(typeof ALL_DEVICES)[0] | null>(null)

  const filtered = filter === 'all' ? ALL_DEVICES : ALL_DEVICES.filter((d) => d.status === filter)

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
              {filtered.map((d) => (
                <div key={d.id} className="device-card" onClick={() => setSelectedDevice(d)} style={{ cursor: 'pointer' }}>
                  <div className={`device-card-indicator ${d.status}`} />
                  <div className="device-card-info">
                    <div className="device-card-name">{d.name}</div>
                    <div className="device-card-meta">{d.id} · {d.gateway}</div>
                  </div>
                  <div className="device-card-value">{d.temp > 0 ? `${d.temp}°C` : '—'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="alarms-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Dispositivo</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Gateway</th>
                    <th>Última Leitura</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr key={d.id} onClick={() => setSelectedDevice(d)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{d.name}</div>
                        <div className="alarm-device">{d.id}</div>
                      </td>
                      <td>{d.type}</td>
                      <td>
                        <span className={`alarm-severity ${d.status === 'online' ? 'low' : d.status === 'warning' ? 'medium' : 'critical'}`}>
                          <span className="alarm-severity-dot" />{STATUS_LABELS[d.status]?.label}
                        </span>
                      </td>
                      <td>{d.gateway}</td>
                      <td className="alarm-time">{d.lastSeen}</td>
                      <td>
                        <div className="alarm-actions">
                          <button className="alarm-action-btn"><Edit /></button>
                          <button className="alarm-action-btn"><RotateCcw /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <span className="alarm-time" style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
          Mostrando {filtered.length} de {ALL_DEVICES.length} dispositivos
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
                    ['ID', selectedDevice.id],
                    ['Modelo', selectedDevice.model],
                    ['Tipo', selectedDevice.type],
                    ['Status', selectedDevice.status],
                    ['Localização', selectedDevice.location],
                    ['Gateway', selectedDevice.gateway],
                    ['IP', selectedDevice.ip],
                    ['MAC', selectedDevice.mac],
                    ['Protocolo', selectedDevice.protocol],
                    ['Última leitura', selectedDevice.lastSeen],
                    ['Uptime', selectedDevice.uptime],
                    ['Temperatura', `${selectedDevice.temp > 0 ? `${selectedDevice.temp}°C` : '—'}`],
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
