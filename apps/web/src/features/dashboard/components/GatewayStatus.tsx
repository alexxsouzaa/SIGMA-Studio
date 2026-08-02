import { ExternalLink, Wifi, Cable, Radio, Bluetooth } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const gateways = [
  { name: 'GW-Principal', protocol: 'MQTT Broker', status: 'online' as const, icon: Wifi },
  { name: 'GW-Modbus-01', protocol: 'Modbus TCP', status: 'online' as const, icon: Cable },
  { name: 'GW-OPC-UA-01', protocol: 'OPC-UA', status: 'degraded' as const, icon: Radio },
  { name: 'GW-BLE-ZoneA', protocol: 'BLE 5.0', status: 'online' as const, icon: Bluetooth },
]

export function GatewayStatus() {
  const navigate = useNavigate()

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="widget-title">
          <RouterIcon />Gateways
        </div>
        <div className="widget-actions">
          <button className="widget-action-btn" aria-label="Ver todos" onClick={() => navigate('/app/gateways')}>
            <ExternalLink />
          </button>
        </div>
      </div>
      <div className="widget-body">
        <div className="gateway-list">
          {gateways.map((gw) => {
            const Icon = gw.icon
            return (
              <div key={gw.name} className="gateway-item">
                <div className="gateway-item-icon"><Icon /></div>
                <div className="gateway-item-info">
                  <div className="gateway-item-name">{gw.name}</div>
                  <div className="gateway-item-protocol">{gw.protocol}</div>
                </div>
                <div className={`gateway-item-status ${gw.status}`}>
                  <span className="gateway-item-status-dot" />
                  {gw.status === 'online' ? 'Online' : gw.status === 'degraded' ? 'Degradado' : 'Offline'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function RouterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg-muted)' }}>
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  )
}
