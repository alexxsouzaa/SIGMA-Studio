import { Settings } from 'lucide-react'

const insights = [
  {
    badge: 'Previsão',
    time: 'há 8min',
    text: 'Temperatura do PLC-07 deve atingir ',
    metric: '85°C',
    suffix: ' nas próximas 2h. Recomendação: reduzir carga na Linha 3 ou ativar resfriamento auxiliar.',
  },
  {
    badge: 'Anomalia',
    time: 'há 23min',
    text: 'Padrão anômalo detectado no Sensor-T21. Oscilação de ',
    metric: '±4,2°C',
    suffix: ' em 15min — fora do comportamento histórico de 97,3%.',
  },
  {
    badge: 'Otimização',
    time: 'há 1h',
    text: 'Consumo energético da Zona B ',
    metric: '12% acima',
    suffix: ' da média. Possível causa: RTU-Festo em modo contínuo ao invés de intermitente.',
  },
]

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
        <div className="ai-insight-list">
          {insights.map((item, i) => (
            <div key={i} className="ai-insight-item">
              <div className="ai-insight-header">
                <span className="ai-insight-badge">{item.badge}</span>
                <span className="ai-insight-time">{item.time}</span>
              </div>
              <div className="ai-insight-text">
                {item.text}
                <span className="ai-insight-metric">{item.metric}</span>
                {item.suffix}
              </div>
            </div>
          ))}
        </div>
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
