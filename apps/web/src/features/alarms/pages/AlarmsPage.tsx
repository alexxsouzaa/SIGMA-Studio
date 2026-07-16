import { useState } from 'react'
import { BellRing, Download, X, Check, Eye, AlertTriangle, Info, ShieldAlert } from 'lucide-react'

const ALL_ALARMS = [
  { id: 'ALM-014', title: 'Alta vibração na bomba BC-001', desc: 'Vibração atingiu 14.2mm/s, ultrapassando o limite de segurança de 10mm/s.', severity: 'critical', device: 'DEV-001', location: 'Linha 3', rule: 'Vibration > 10mm/s', value: '14.2mm/s', threshold: '10.0mm/s', status: 'active', time: 'Há 12 min', timestamp: '2026-07-16 08:42', timeline: [{ time: '08:42', text: 'Alarme gerado automaticamente', type: 'critical' }] },
  { id: 'ALM-018', title: 'Temperatura elevada PLC-07', desc: 'Temperatura do controlador atingiu 82.3°C, próximo do limite crítico de 85°C.', severity: 'critical', device: 'DEV-001', location: 'Linha 3', rule: 'Temp > 80°C', value: '82.3°C', threshold: '80.0°C', status: 'active', time: 'Há 8 min', timestamp: '2026-07-16 08:46', timeline: [{ time: '08:46', text: 'Alarme gerado automaticamente', type: 'critical' }] },
  { id: 'ALM-025', title: 'Latência elevada no Gateway-M04', desc: 'Jitter EtherCAT ultrapassou 2ms, afetando sincronização dos dispositivos.', severity: 'warning', device: 'DEV-005', location: 'Rack 2', rule: 'Jitter > 1.5ms', value: '4.2ms', threshold: '1.5ms', status: 'acked', time: 'Há 45 min', timestamp: '2026-07-16 08:09', timeline: [{ time: '08:09', text: 'Alarme gerado automaticamente', type: 'warning' }, { time: '08:20', text: 'Reconhecido por Ana Silva', type: 'info' }] },
  { id: 'ALM-031', title: 'Dispositivo offline - Sensor-P12', desc: 'Sensor Phoenix sem heartbeat há mais de 10 minutos. Possível falha de bateria ou comunicação.', severity: 'warning', device: 'DEV-012', location: 'Zona A', rule: 'Heartbeat timeout > 600s', value: '—', threshold: '600s', status: 'active', time: 'Há 12 min', timestamp: '2026-07-16 08:42', timeline: [{ time: '08:42', text: 'Alarme gerado automaticamente', type: 'warning' }] },
  { id: 'ALM-019', title: 'Falta de fluxo na bomba BV-012', desc: 'Sensor de vazão reportando 0 L/min na válvula de saída da bomba de vácuo.', severity: 'warning', device: 'DEV-008', location: 'Linha 1', rule: 'Flow = 0 L/min', value: '0.0 L/min', threshold: '> 0 L/min', status: 'resolved', time: 'Há 3 horas', timestamp: '2026-07-16 05:30', timeline: [{ time: '05:30', text: 'Alarme gerado automaticamente', type: 'warning' }, { time: '05:45', text: 'Reconhecido por Ana Silva', type: 'info' }, { time: '06:10', text: 'Resolvido por Ana Silva', type: 'success' }] },
  { id: 'ALM-022', title: 'Oscilação de pressão RTU-Festo', desc: 'Pressão variando amplitude > 1.5 bar no atuador pneumático.', severity: 'info', device: 'DEV-008', location: 'Linha 1', rule: 'Pressure variance > 1.0 bar', value: '6.3 bar', threshold: '5.0 bar', status: 'active', time: 'Há 1 hora', timestamp: '2026-07-16 07:54', timeline: [{ time: '07:54', text: 'Alarme gerado automaticamente', type: 'info' }] },
]

const FILTERS = [
  { label: 'Todos', value: 'all', count: ALL_ALARMS.length, color: 'var(--fg-secondary)' },
  { label: 'Crítico', value: 'critical', count: ALL_ALARMS.filter((a) => a.severity === 'critical').length, color: 'var(--danger)' },
  { label: 'Alerta', value: 'warning', count: ALL_ALARMS.filter((a) => a.severity === 'warning').length, color: 'var(--warning)' },
  { label: 'Info', value: 'info', count: ALL_ALARMS.filter((a) => a.severity === 'info').length, color: 'var(--info)' },
]

const SEV_MAP: Record<string, { label: string; className: string }> = {
  critical: { label: 'Crítico', className: 'critical' },
  warning: { label: 'Alerta', className: 'high' },
  info: { label: 'Informativo', className: 'medium' },
}

const STATUS_MAP: Record<string, string> = {
  active: 'Ativo',
  acked: 'Reconhecido',
  resolved: 'Resolvido',
  silenced: 'Silenciado',
}

export default function AlarmsPage() {
  const [filter, setFilter] = useState('all')
  const [selectedAlarm, setSelectedAlarm] = useState<(typeof ALL_ALARMS)[0] | null>(null)
  const [alarms, setAlarms] = useState(ALL_ALARMS)

  const filtered = filter === 'all' ? alarms : alarms.filter((a) => a.severity === filter)

  function acknowledge(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setAlarms((prev) =>
      prev.map((a) =>
        a.id === id && a.status === 'active'
          ? { ...a, status: 'acked' as const, timeline: [...a.timeline, { time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), text: 'Reconhecido por Ana Silva', type: 'info' as const }] }
          : a,
      ),
    )
  }

  function resolve(id: string) {
    setAlarms((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'resolved' as const, timeline: [...a.timeline, { time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), text: 'Resolvido por Ana Silva', type: 'success' as const }] }
          : a,
      ),
    )
    setSelectedAlarm(null)
  }

  const stats = [
    { label: 'Total', value: alarms.length, icon: BellRing, className: 'accent' },
    { label: 'Críticos', value: alarms.filter((a) => a.severity === 'critical').length, icon: ShieldAlert, className: 'danger' },
    { label: 'Alertas', value: alarms.filter((a) => a.severity === 'warning').length, icon: AlertTriangle, className: 'warning' },
    { label: 'Informativos', value: alarms.filter((a) => a.severity === 'info').length, icon: Info, className: 'info' },
  ]

  return (
    <>
      <div className="kpi-grid">
        {stats.map((s) => (
          <div className="kpi-card" key={s.label}>
            <div className="kpi-card-header">
              <span className="kpi-card-label">{s.label}</span>
              <div className={`kpi-card-icon ${s.className}`}><s.icon /></div>
            </div>
            <div className="kpi-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="widget">
        <div className="widget-header">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={`filter-chip${filter === f.value ? ' active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {filter === f.value && <span className="filter-chip-dot" style={{ background: f.color }} />}
                {f.label}
                <span className="filter-chip-count">{f.count}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto' }}>
              <Download /> Exportar
            </button>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)' }}>
              Silenciar todos
            </button>
          </div>
        </div>
        <div className="widget-body" style={{ padding: 0 }}>
          <table className="alarms-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Severidade</th>
                <th>Alarme</th>
                <th>Dispositivo</th>
                <th>Horário</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const sev = SEV_MAP[a.severity]
                return (
                  <tr key={a.id} onClick={() => setSelectedAlarm(a)} style={{ cursor: 'pointer' }}>
                    <td><span className={`alarm-severity ${sev.className}`}><span className="alarm-severity-dot" />{sev.label}</span></td>
                    <td style={{ maxWidth: 280 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.desc}</div>
                    </td>
                    <td className="alarm-device">{a.device}</td>
                    <td className="alarm-time">{a.time}</td>
                    <td>{STATUS_MAP[a.status]}</td>
                    <td>
                      <div className="alarm-actions">
                        {a.status === 'active' && (
                          <button className="alarm-action-btn" onClick={(e) => acknowledge(a.id, e)} title="Reconhecer"><Check /></button>
                        )}
                        <button className="alarm-action-btn" onClick={(e) => { e.stopPropagation(); setSelectedAlarm(a) }}><Eye /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAlarm && (
        <>
          <div className="detail-overlay" onClick={() => setSelectedAlarm(null)} />
          <div className="detail-panel open" style={{ zIndex: 51 }}>
            <div className="detail-header">
              <h3>{selectedAlarm.title}</h3>
              <button onClick={() => setSelectedAlarm(null)}><X /></button>
            </div>
            <div className="detail-body">
              <div className="detail-section">
                <div className="detail-section-title">Informações do Alarme</div>
                <div className="detail-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    ['ID', selectedAlarm.id],
                    ['Severidade', SEV_MAP[selectedAlarm.severity].label],
                    ['Dispositivo', selectedAlarm.device],
                    ['Localização', selectedAlarm.location],
                    ['Regra', selectedAlarm.rule],
                    ['Valor atual', selectedAlarm.value],
                    ['Limite', selectedAlarm.threshold],
                    ['Status', STATUS_MAP[selectedAlarm.status]],
                    ['Data/Hora', selectedAlarm.timestamp],
                  ].map(([label, value]) => (
                    <div key={label} className="detail-info-item">
                      <div style={{ fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="detail-divider" />
              <div className="detail-section">
                <div className="detail-section-title">Descrição</div>
                <p style={{ fontSize: 13, color: 'var(--fg-secondary)', lineHeight: 1.6 }}>{selectedAlarm.desc}</p>
              </div>
              <div className="detail-divider" />
              <div className="detail-section">
                <div className="detail-section-title">Histórico</div>
                <div className="alarm-timeline" style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 16, borderLeft: '1px solid var(--border)' }}>
                  {selectedAlarm.timeline.map((t, i) => (
                    <div key={i} style={{ position: 'relative', paddingLeft: 16, fontSize: 13, color: 'var(--fg-secondary)' }}>
                      <span style={{ position: 'absolute', left: -22, top: 4, width: 10, height: 10, borderRadius: '50%', background: t.type === 'critical' ? 'var(--danger)' : t.type === 'warning' ? 'var(--warning)' : t.type === 'success' ? 'var(--success)' : 'var(--info)' }} />
                      <div style={{ fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>{t.time}</div>
                      <div>{t.text}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="detail-actions">
                {selectedAlarm.status === 'active' && (
                  <>
                    <button className="widget-action-btn" style={{ flex: 1, padding: '8px', width: 'auto', background: 'var(--success-muted)', color: 'var(--success)' }} onClick={() => { acknowledge(selectedAlarm.id, { stopPropagation: () => {} } as React.MouseEvent) }}><Check /> Confirmar</button>
                    <button className="widget-action-btn" style={{ flex: 1, padding: '8px', width: 'auto', color: 'var(--warning)' }}>Silenciar</button>
                  </>
                )}
                {selectedAlarm.status === 'acked' && (
                  <>
                    <button className="widget-action-btn" style={{ flex: 1, padding: '8px', width: 'auto', background: 'var(--success-muted)', color: 'var(--success)' }} onClick={() => resolve(selectedAlarm.id)}><Check /> Resolver</button>
                    <button className="widget-action-btn" style={{ flex: 1, padding: '8px', width: 'auto', color: 'var(--warning)' }}>Silenciar</button>
                  </>
                )}
                {selectedAlarm.status === 'resolved' && (
                  <button className="widget-action-btn" style={{ flex: 1, padding: '8px', width: 'auto' }} onClick={() => setSelectedAlarm(null)}>Fechar</button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
