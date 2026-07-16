import { ExternalLink } from 'lucide-react'
import { EmptyState } from '@/lib/hooks'

// TODO: connect to GET /api/v1/gateways when endpoint exists

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
        <EmptyState
          title="Nenhum gateway configurado"
          description="Endpoint de gateways sera conectado em breve"
        />
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
