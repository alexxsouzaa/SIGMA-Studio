import { Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '@/lib/hooks'
import { LoadingSpinner, EmptyState } from '@/components/shared/StatusStates'

interface AiModelItem {
  name: string
  type: string
  status: string
  accuracy: number
  description: string | null
}

const STATUS_LABELS: Record<string, string> = {
  production: 'Produção',
  staging: 'Staging',
  training: 'Treinamento',
  development: 'Desenvolvimento',
}

export function AiInsights() {
  const navigate = useNavigate()
  const { data: models, isLoading, error } = useApi<AiModelItem[]>('/dashboard/ai-insights')

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="widget-title">
          <BrainIcon />Insights de IA
        </div>
        <div className="widget-subtitle">TinyML · Edge inference</div>
        <div className="widget-actions">
          <button className="widget-action-btn" aria-label="Configurar" onClick={() => navigate('/app/ia')}>
            <Settings />
          </button>
        </div>
      </div>
      <div className="widget-body">
        {isLoading && <LoadingSpinner />}
        {error && <div className="empty-state-text">Erro ao carregar insights</div>}
        {!isLoading && !error && (!models || models.length === 0) && (
          <EmptyState title="Nenhum modelo treinado" description="Treine um modelo TinyML para ver insights." />
        )}
        {!isLoading && !error && models && models.length > 0 && (
          <div className="ai-insight-list">
            {models.map((m) => {
              const badge = STATUS_LABELS[m.status] ?? m.status
              const accuracy = m.accuracy != null ? `${(m.accuracy * 100).toFixed(1)}%` : '—'
              return (
                <div key={m.name} className="ai-insight-item">
                  <div className="ai-insight-header">
                    <span className="ai-insight-badge">{badge}</span>
                    <span className="ai-insight-time">{m.type}</span>
                  </div>
                  <div className="ai-insight-text">
                    {m.description ?? `Modelo ${m.type} ativo`}
                    <span className="ai-insight-metric"> {accuracy}</span>
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
