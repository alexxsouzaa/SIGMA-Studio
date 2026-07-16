import { Filter, Download, ExternalLink } from 'lucide-react'
import { EmptyState } from '@/lib/hooks'

// TODO: connect to GET /api/v1/alerts when endpoint exists

export function AlarmsTable() {
  return (
    <div className="widget" style={{ gridColumn: 'span 2' }}>
      <div className="widget-header">
        <div className="widget-title">
          <BellRingIcon />Alarmes Recentes
        </div>
        <div className="widget-actions">
          <button className="widget-action-btn" aria-label="Filtrar">
            <Filter />
          </button>
          <button className="widget-action-btn" aria-label="Exportar">
            <Download />
          </button>
          <button className="widget-action-btn" aria-label="Ver todos">
            <ExternalLink />
          </button>
        </div>
      </div>
      <div className="widget-body-flush">
        <table className="alarms-table">
          <thead>
            <tr>
              <th>Severidade</th>
              <th>Dispositivo</th>
              <th>Descricao</th>
              <th>Valor</th>
              <th>Horario</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6}>
                <EmptyState
                  title="Nenhum alarme ativo"
                  description="Endpoint de alarmes sera conectado em breve"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BellRingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg-muted)' }}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 4 11 4 11H2s4-4 4-11" />
      <path d="M9.5 17.5a2.5 2.5 0 0 0 5 0" />
    </svg>
  )
}
