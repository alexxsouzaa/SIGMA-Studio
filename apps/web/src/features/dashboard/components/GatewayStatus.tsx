import { ExternalLink } from 'lucide-react'

const gateways = [
  { name: 'GW-Principal', protocol: 'MQTT Broker', icon: 'wifi', status: 'online' as const },
  { name: 'GW-Modbus-01', protocol: 'Modbus TCP', icon: 'cable', status: 'online' as const },
  { name: 'GW-OPC-UA-01', protocol: 'OPC-UA', icon: 'radio', status: 'degraded' as const },
  { name: 'GW-BLE-ZoneA', protocol: 'BLE 5.0', icon: 'bluetooth', status: 'online' as const },
]

export function GatewayStatus() {
  return (
    <div className="widget">
      <div className="widget-header">
        <div className="widget-title">
          <RouterIcon />Gateways
        </div>
        <div className="widget-actions">
          <button className="widget-action-btn" aria-label="Ver todos">
            <ExternalLink />
          </button>
        </div>
      </div>
      <div className="widget-body">
        <div className="gateway-list">
          {gateways.map((g) => (
            <div key={g.name} className="gateway-item">
              <div className="gateway-item-icon">
                <GatewayIcon type={g.icon} />
              </div>
              <div className="gateway-item-info">
                <div className="gateway-item-name">{g.name}</div>
                <div className="gateway-item-protocol">{g.protocol}</div>
              </div>
              <div className={`gateway-item-status ${g.status}`}>
                <span className="gateway-item-status-dot" />
                {g.status === 'online' ? 'Online' : g.status === 'degraded' ? 'Degradado' : 'Offline'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GatewayIcon({ type }: { type: string }) {
  const props = { width: 18, height: 18, stroke: 'currentColor', strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (type) {
    case 'wifi':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M12 20h.01" /><path d="M2 8.82a15 15 0 0 1 20 0" /><path d="M5 12.86a10 10 0 0 1 14 0" /><path d="M8.5 16.43a5 5 0 0 1 7 0" />
        </svg>
      )
    case 'cable':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    case 'radio':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" /><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" /><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" /><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
        </svg>
      )
    case 'bluetooth':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <polyline points="6 7 12 13 6 19" /><polyline points="12 7 6 13 12 19" /><polyline points="12 2 12 22" /><line x1="12" y1="12" x2="18" y2="6" /><line x1="12" y1="12" x2="18" y2="18" />
        </svg>
      )
    default:
      return (
        <svg {...props} viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
        </svg>
      )
  }
}

function RouterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg-muted)' }}>
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  )
}
