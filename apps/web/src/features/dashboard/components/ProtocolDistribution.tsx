import { EmptyState } from '@/lib/hooks'

// TODO: connect to GET /api/v1/dashboard/protocols when endpoint exists

export function ProtocolDistribution() {
  return (
    <div className="widget">
      <div className="widget-header">
        <div className="widget-title">
          <RadioIcon />Distribuicao de Protocolos
        </div>
      </div>
      <div className="widget-body">
        <EmptyState title="Dados de protocolos indisponiveis" />
      </div>
    </div>
  )
}

function RadioIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg-muted)' }}>
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" /><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" /><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" /><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
    </svg>
  )
}
