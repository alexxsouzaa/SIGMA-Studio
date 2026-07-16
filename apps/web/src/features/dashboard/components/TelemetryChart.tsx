import { useState } from 'react'
import { Activity, Maximize2, MoreVertical } from 'lucide-react'
import { EmptyState } from '@/lib/hooks'

// TODO: connect to GET /api/v1/telemetry when endpoint exists

const ranges = ['24h', '7d', '30d'] as const
type Range = (typeof ranges)[number]

export function TelemetryChart() {
  const [activeRange, setActiveRange] = useState<Range>('24h')

  return (
    <div className="widget">
      <div className="widget-header">
        <div>
          <div className="widget-title">
            <Activity />
            Telemetria — Ultimas 24h
          </div>
        </div>
        <div className="widget-actions">
          <div className="telemetry-chart-tabs">
            {ranges.map((r) => (
              <button
                key={r}
                className={`telemetry-chart-tab${activeRange === r ? ' active' : ''}`}
                onClick={() => setActiveRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
          <button className="widget-action-btn" aria-label="Expandir">
            <Maximize2 />
          </button>
          <button className="widget-action-btn" aria-label="Mais opcoes">
            <MoreVertical />
          </button>
        </div>
      </div>

      <div className="widget-body">
        <EmptyState title="Dados de telemetria indisponiveis" />
      </div>

      <div className="telemetry-chart-legend">
        <div className="telemetry-chart-legend-item">
          <span
            className="telemetry-chart-legend-dot"
            style={{ background: 'var(--accent)' }}
          />
          Temperatura (°C)
        </div>
        <div className="telemetry-chart-legend-item">
          <span
            className="telemetry-chart-legend-dot"
            style={{ background: 'var(--info)' }}
          />
          Pressao (bar)
        </div>
        <div className="telemetry-chart-legend-item">
          <span
            className="telemetry-chart-legend-dot"
            style={{ background: 'var(--success)' }}
          />
          Umidade (%)
        </div>
      </div>
    </div>
  )
}
