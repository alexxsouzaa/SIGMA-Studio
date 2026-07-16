import { Settings } from 'lucide-react'
import { EmptyState } from '@/lib/hooks'

// TODO: connect to GET /api/v1/ai/insights when endpoint exists

export function AiInsights() {
  return (
    <div className="widget">
      <div className="widget-header">
        <div className="widget-title">
          <BrainIcon />Insights de IA
        </div>
        <div className="widget-subtitle">TinyML · Edge inference</div>
        <div className="widget-actions">
          <button className="widget-action-btn" aria-label="Configurar">
            <Settings />
          </button>
        </div>
      </div>
      <div className="widget-body">
        <EmptyState
          title="Nenhum insight disponivel"
          description="Modelos de IA em treinamento"
        />
      </div>
    </div>
  )
}

function BrainIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg-muted)' }}>
      <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.7 3.67 2.5 2.5 0 0 0-.09 4.79 2.5 2.5 0 0 0 1.79 4.07 2.5 2.5 0 0 0 4.96.46" />
      <path d="M12 4.5a2.5 2.5 0 0 1 4.96-.46 2.5 2.5 0 0 1 1.7 3.67 2.5 2.5 0 0 1 .09 4.79 2.5 2.5 0 0 1-1.79 4.07 2.5 2.5 0 0 1-4.96.46" />
      <path d="M9 16.5V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3.5" />
      <path d="M12 12V4.5" /><path d="M12 12v3" /><path d="M8 15h.01" /><path d="M16 15h.01" />
    </svg>
  )
}
