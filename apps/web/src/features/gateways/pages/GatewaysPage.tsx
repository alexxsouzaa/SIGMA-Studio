import { useState } from 'react'
import { Router, Plus, Radio, Wifi, Cable, Bluetooth } from 'lucide-react'

const ALL_GATEWAYS = [
  { id: 'GW-Principal', name: 'Gateway Principal', location: 'Sala de Controle', firmware: 'v4.2.1', status: 'online', ip: '192.168.1.1', protocols: ['MQTT', 'OPC-UA', 'Modbus'], devices: 612, traffic: 248, cpu: 34, mem: 42, uptime: '127d 14h', lastSeen: 'Há 2s', iconType: 'wifi' },
  { id: 'GW-Modbus-01', name: 'Gateway Modbus', location: 'Painel Linha 3', firmware: 'v3.8.0', status: 'online', ip: '192.168.1.10', protocols: ['Modbus', 'CAN Bus'], devices: 298, traffic: 156, cpu: 22, mem: 31, uptime: '89d 3h', lastSeen: 'Há 5s', iconType: 'cable' },
  { id: 'GW-OPC-UA-01', name: 'Gateway OPC-UA', location: 'Rack 2', firmware: 'v4.1.2', status: 'warning', ip: '192.168.1.20', protocols: ['OPC-UA', 'BACnet'], devices: 224, traffic: 112, cpu: 68, mem: 78, uptime: '30d 8h', lastSeen: 'Há 30s', iconType: 'radio' },
  { id: 'GW-BLE-ZoneA', name: 'Gateway BLE Zona A', location: 'Zona A - Forno', firmware: 'v2.4.0', status: 'online', ip: '192.168.1.30', protocols: ['BLE'], devices: 141, traffic: 48, cpu: 12, mem: 18, uptime: '245d 3h', lastSeen: 'Há 10s', iconType: 'bluetooth' },
]

const FILTERS = [
  { label: 'Todos', value: 'all', count: ALL_GATEWAYS.length },
  { label: 'Online', value: 'online', count: ALL_GATEWAYS.filter((g) => g.status === 'online').length },
  { label: 'Alerta', value: 'warning', count: ALL_GATEWAYS.filter((g) => g.status === 'warning').length },
  { label: 'Offline', value: 'offline', count: ALL_GATEWAYS.filter((g) => g.status === 'offline').length },
]

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  online: { label: 'Online', className: 'online' },
  warning: { label: 'Degradado', className: 'degraded' },
  offline: { label: 'Offline', className: 'offline' },
}

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  wifi: Wifi,
  cable: Cable,
  radio: Radio,
  bluetooth: Bluetooth,
}

export default function GatewaysPage() {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? ALL_GATEWAYS : ALL_GATEWAYS.filter((g) => g.status === filter)

  const stats = [
    { label: 'Gateways', value: ALL_GATEWAYS.length, className: 'accent' },
    { label: 'Online', value: ALL_GATEWAYS.filter((g) => g.status === 'online').length, className: 'success' },
    { label: 'Alerta', value: ALL_GATEWAYS.filter((g) => g.status === 'warning').length, className: 'warning' },
    { label: 'Offline', value: ALL_GATEWAYS.filter((g) => g.status === 'offline').length, className: 'danger' },
  ]

  return (
    <>
      <div className="kpi-grid">
        {stats.map((s) => (
          <div className="kpi-card" key={s.label}>
            <div className="kpi-card-header">
              <span className="kpi-card-label">{s.label}</span>
              <div className={`kpi-card-icon ${s.className}`}><Router /></div>
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
                <span className="filter-chip-count">{f.count}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto' }}>
              <Radio /> Escanear
            </button>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto', background: 'var(--fg)', color: 'var(--bg)' }}>
              <Plus /> Adicionar Gateway
            </button>
          </div>
        </div>

        <div className="widget-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 12 }}>
            {filtered.map((gw) => {
              const status = STATUS_MAP[gw.status]
              const IconComp = iconMap[gw.iconType] || Router
              return (
                <div key={gw.id} className="widget" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: 'var(--radius-md)',
                        background: gw.status === 'online' ? 'var(--success-muted)' : gw.status === 'warning' ? 'var(--warning-muted)' : 'var(--danger-muted)',
                        color: gw.status === 'online' ? 'var(--success)' : gw.status === 'warning' ? 'var(--warning)' : 'var(--danger)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <IconComp size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{gw.name}</div>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>{gw.id}</div>
                    </div>
                    <span className={`gateway-item-status ${status.className}`}>
                      <span className="gateway-item-status-dot" />
                      {status.label}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', marginBottom: 14 }}>
                    {[
                      ['Localização', gw.location],
                      ['Firmware', gw.firmware],
                      ['IP', gw.ip],
                      ['Uptime', gw.uptime],
                      ['Última com.', gw.lastSeen],
                      ['Dispositivos', String(gw.devices)],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fg-muted)', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
                    {gw.protocols.map((p) => (
                      <span key={p} style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '2px 8px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', color: 'var(--fg-secondary)' }}>{p}</span>
                    ))}
                  </div>

                  <div className="protocol-bars" style={{ gap: 6, marginBottom: 14 }}>
                    {[
                      { label: 'Tráfego', value: gw.traffic, color: 'var(--info)' },
                      { label: 'CPU', value: gw.cpu, color: 'var(--warning)' },
                      { label: 'Memória', value: gw.mem, color: 'var(--success)' },
                    ].map((m) => (
                      <div className="protocol-bar-item" key={m.label}>
                        <div className="protocol-bar-header">
                          <span className="protocol-bar-name">{m.label}</span>
                          <span className="protocol-bar-value">{m.value}{m.label === 'Tráfego' ? ' msg/s' : '%'}</span>
                        </div>
                        <div className="protocol-bar-track">
                          <div className="protocol-bar-fill" style={{ width: `${m.value}%`, maxWidth: '100%', background: m.color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                    {['Detalhes', 'Config', 'Console'].map((action) => (
                      <button key={action} className="widget-action-btn" style={{ padding: '8px', width: 'auto', justifyContent: 'center', fontSize: 12 }}>{action}</button>
                    ))}
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
