import { ExternalLink, Wifi, Cable, Radio, Bluetooth } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '@/lib/hooks'
import { LoadingSpinner, EmptyState } from '@/components/shared/StatusStates'

interface GatewayItem {
  name: string
  protocol: string
  status: string
}

const PROTOCOL_ICONS: Record<string, typeof Wifi> = {
  MQTT: Wifi,
  'Modbus TCP': Cable,
  'OPC-UA': Radio,
  'BLE 5.0': Bluetooth,
}

const STATUS_LABELS: Record<string, string> = {
  online: 'Online',
  warning: 'Degradado',
  degraded: 'Degradado',
  offline: 'Offline',
}

const STATUS_CLASS: Record<string, string> = {
  online: 'online',
  warning: 'degraded',
  degraded: 'degraded',
  offline: 'offline',
}

export function GatewayStatus() {
  const navigate = useNavigate()
  const { data: gateways, isLoading, error } = useApi<GatewayItem[]>('/dashboard/gateways')

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
        {isLoading && <LoadingSpinner />}
        {error && <div className="empty-state-text">Erro ao carregar gateways</div>}
        {!isLoading && !error && (!gateways || gateways.length === 0) && (
          <EmptyState title="Nenhum gateway configurado" />
        )}
        {!isLoading && !error && gateways && gateways.length > 0 && (
          <div className="gateway-list">
            {gateways.map((gw) => {
              const Icon = PROTOCOL_ICONS[gw.protocol] ?? Wifi
              return (
                <div key={gw.name} className="gateway-item">
                  <div className="gateway-item-icon"><Icon /></div>
                  <div className="gateway-item-info">
                    <div className="gateway-item-name">{gw.name}</div>
                    <div className="gateway-item-protocol">{gw.protocol}</div>
                  </div>
                  <div className={`gateway-item-status ${STATUS_CLASS[gw.status] ?? 'offline'}`}>
                    <span className="gateway-item-status-dot" />
                    {STATUS_LABELS[gw.status] ?? gw.status}
                  </div>
                </div>
              )
            })}
          </div>
        )}
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
