import { ExternalLink, Cpu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDevices, LoadingSpinner, ErrorState, EmptyState } from '@/lib/hooks'

export function DeviceStatus() {
  const { data: devices, isLoading, error, refetch } = useDevices()
  const navigate = useNavigate()

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="widget-title">
          <CpuIcon />Status dos Dispositivos
        </div>
        <div className="widget-actions">
          <button className="widget-action-btn" aria-label="Ver todos" onClick={() => navigate('/app/devices')}>
            <ExternalLink />
          </button>
        </div>
      </div>
      <div className="widget-body">
        {isLoading && <LoadingSpinner />}
        {error && (
          <ErrorState
            message={error}
            onRetry={() => refetch()}
          />
        )}
        {!isLoading && !error && (!devices || devices.length === 0) && (
          <EmptyState title="Nenhum dispositivo encontrado" />
        )}
        {!isLoading && !error && devices && devices.length > 0 && (
          <div className="gateway-list">
            {devices.slice(0, 4).map((d) => (
              <div key={d.serial_number} className="gateway-item">
                <div className="gateway-item-icon"><Cpu /></div>
                <div className="gateway-item-info">
                  <div className="gateway-item-name">{d.name}</div>
                  <div className="gateway-item-protocol">{d.serial_number}</div>
                </div>
                <div className={`gateway-item-status ${d.active ? 'online' : 'offline'}`}>
                  <span className="gateway-item-status-dot" />
                  {d.active ? 'Online' : 'Offline'}
                </div>
              </div>
            ))}
          </div>
        )}
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
