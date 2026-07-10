import { Filter, Download, ExternalLink, Check } from 'lucide-react'

const alarms = [
  { severity: 'critical' as const, label: 'Crítico', device: 'PLC-07', desc: 'Temperatura acima do limite — 82,3°C / 80°C', value: '82,3°C', valueColor: 'var(--danger)', time: '14:32:18' },
  { severity: 'high' as const, label: 'Alto', device: 'Gateway-M04', desc: 'Latência elevada — EtherCAT jitter > 2ms', value: '4,2ms', valueColor: 'var(--warning)', time: '14:28:05' },
  { severity: 'high' as const, label: 'Alto', device: 'Sensor-P12', desc: 'Dispositivo offline — sem heartbeat há 12min', value: '—', valueColor: 'var(--danger)', time: '14:21:33' },
  { severity: 'medium' as const, label: 'Médio', device: 'RTU-Festo', desc: 'Pressão variando — amplitude > 1,5 bar', value: '6,3 bar', valueColor: 'var(--info)', time: '14:15:47' },
  { severity: 'low' as const, label: 'Baixo', device: 'Sensor-T21', desc: 'Bateria baixa — 18% restante', value: '18%', valueColor: 'var(--success)', time: '14:08:12' },
]

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
              <th>Descrição</th>
              <th>Valor</th>
              <th>Horário</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {alarms.map((a, i) => (
              <tr key={i}>
                <td>
                  <span className={`alarm-severity ${a.severity}`}>
                    <span className="alarm-severity-dot" />
                    {a.label}
                  </span>
                </td>
                <td className="alarm-device">{a.device}</td>
                <td>{a.desc}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: a.valueColor }}>
                  {a.value}
                </td>
                <td className="alarm-time">{a.time}</td>
                <td className="alarm-actions">
                  <button className="alarm-action-btn" aria-label="Confirmar">
                    <Check />
                  </button>
                  <button className="alarm-action-btn" aria-label="Detalhes">
                    <ExternalLink />
                  </button>
                </td>
              </tr>
            ))}
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
