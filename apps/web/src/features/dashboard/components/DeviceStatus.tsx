import { ExternalLink } from 'lucide-react'

const devices = [
  { name: 'PLC-07 Siemens S7-1500', meta: 'Linha 3 · Modbus TCP', indicator: 'online' as const, value: '72,4°C', color: 'var(--success)' },
  { name: 'Sensor-T21 ABB CT310', meta: 'Zona B · MQTT', indicator: 'online' as const, value: '23,1°C', color: 'var(--fg)' },
  { name: 'Gateway-M04 Beckhoff', meta: 'Rack 2 · EtherCAT', indicator: 'warning' as const, value: '4,2ms', color: 'var(--warning)' },
  { name: 'RTU-Festo VTSA', meta: 'Linha 1 · OPC-UA', indicator: 'online' as const, value: '6,3 bar', color: 'var(--fg)' },
  { name: 'HMI-Panel Schneider', meta: 'Operador 2 · Wi-Fi', indicator: 'online' as const, value: 'Ativo', color: 'var(--success)' },
  { name: 'Sensor-P12 Phoenix', meta: 'Zona A · BLE', indicator: 'offline' as const, value: 'Offline', color: 'var(--danger)' },
]

export function DeviceStatus() {
  return (
    <div className="widget">
      <div className="widget-header">
        <div className="widget-title">
          <CpuIcon />Status dos Dispositivos
        </div>
        <div className="widget-actions">
          <button className="widget-action-btn" aria-label="Ver todos">
            <ExternalLink />
          </button>
        </div>
      </div>
      <div className="widget-body">
        <div className="device-grid">
          {devices.map((d) => (
            <div key={d.name} className="device-card">
              <span className={`device-card-indicator ${d.indicator}`} />
              <div className="device-card-info">
                <div className="device-card-name">{d.name}</div>
                <div className="device-card-meta">{d.meta}</div>
              </div>
              <div className="device-card-value" style={{ color: d.color }}>
                {d.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CpuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg-muted)' }}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2" /><path d="M15 20v2" />
      <path d="M2 15h2" /><path d="M20 15h2" />
      <path d="M2 9h2" /><path d="M20 9h2" />
      <path d="M9 2v2" /><path d="M9 20v2" />
    </svg>
  )
}
