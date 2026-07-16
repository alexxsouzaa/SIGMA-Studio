import { useState } from 'react'
import { HardDrive, Upload, RefreshCw, Eye } from 'lucide-react'

const ALL_DEVICES = [
  { id: 'FW-001', name: 'PLC-07 Siemens S7-1500', type: 'STM32L4', current: 'v4.2.0', latest: 'v4.2.1', status: 'outdated', date: '2026-05-10', progress: 0 },
  { id: 'FW-002', name: 'Sensor-T21 ABB CT310', type: 'ESP32-S3', current: 'v3.1.0', latest: 'v3.1.0', status: 'current', date: '2026-07-01', progress: 100 },
  { id: 'FW-003', name: 'Gateway-M04 Beckhoff', type: 'ARM Cortex-M7', current: 'v2.8.2', latest: 'v2.8.3', status: 'outdated', date: '2026-04-22', progress: 0 },
  { id: 'FW-004', name: 'RTU-Festo VTSA', type: 'ESP32', current: 'v5.0.1', latest: 'v5.0.1', status: 'current', date: '2026-06-15', progress: 100 },
  { id: 'FW-005', name: 'HMI-Panel Schneider', type: 'STM32H7', current: 'v6.2.0', latest: 'v6.3.0', status: 'outdated', date: '2026-03-30', progress: 0 },
  { id: 'FW-006', name: 'Sensor-P12 Phoenix', type: 'RP2040', current: 'v1.9.0', latest: 'v1.9.0', status: 'current', date: '2026-06-28', progress: 100 },
  { id: 'FW-007', name: 'Drive-Freq ABB ACS580', type: 'STM32L4', current: 'v3.4.1', latest: 'v3.4.2', status: 'outdated', date: '2026-05-18', progress: 0 },
  { id: 'FW-008', name: 'Sensor-Vib VibroSyst', type: 'ESP32-S3', current: 'v4.1.0', latest: 'v4.1.0', status: 'current', date: '2026-07-10', progress: 100 },
]

const FILTERS = [
  { label: 'Todos', value: 'all', count: ALL_DEVICES.length },
  { label: 'Atualizados', value: 'current', count: ALL_DEVICES.filter((d) => d.status === 'current').length },
  { label: 'Desatualizados', value: 'outdated', count: ALL_DEVICES.filter((d) => d.status === 'outdated').length },
  { label: 'Falhas', value: 'failed', count: 0 },
  { label: 'Atualizando', value: 'pending', count: 0 },
]

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  current: { label: 'Atualizado', className: 'current' },
  outdated: { label: 'Desatualizado', className: 'outdated' },
  failed: { label: 'Falhou', className: 'failed' },
  pending: { label: 'Atualizando', className: 'pending' },
}

export default function FirmwarePage() {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? ALL_DEVICES : ALL_DEVICES.filter((d) => d.status === filter)

  const stats = [
    { label: 'Dispositivos', value: ALL_DEVICES.length, className: 'accent' },
    { label: 'Atualizados', value: ALL_DEVICES.filter((d) => d.status === 'current').length, className: 'success' },
    { label: 'Desatualizados', value: ALL_DEVICES.filter((d) => d.status === 'outdated').length, className: 'warning' },
    { label: 'Falhas OTA', value: 0, className: 'danger' },
  ]

  return (
    <>
      <div className="kpi-grid">
        {stats.map((s) => (
          <div className="kpi-card" key={s.label}>
            <div className="kpi-card-header">
              <span className="kpi-card-label">{s.label}</span>
              <div className={`kpi-card-icon ${s.className}`}><HardDrive /></div>
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
                {f.label}
                <span className="filter-chip-count">{f.count}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto' }}><RefreshCw /> Verificar</button>
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto', background: 'var(--fg)', color: 'var(--bg)' }}><Upload /> Atualização OTA</button>
          </div>
        </div>
        <div className="widget-body" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="alarms-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Dispositivo</th>
                <th>Versão Atual</th>
                <th>Versão Mais Recente</th>
                <th>Status</th>
                <th>Última Atualização</th>
                <th>Progresso</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const status = STATUS_MAP[d.status]
                return (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>{d.type}</div>
                    </td>
                    <td className="alarm-device">{d.current}</td>
                    <td className="alarm-device">{d.latest}</td>
                    <td>
                      <span className={`alarm-severity ${d.status === 'current' ? 'low' : 'medium'}`}>
                        <span className="alarm-severity-dot" />{status.label}
                      </span>
                    </td>
                    <td className="alarm-time">{d.date}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 80, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 2, width: `${d.progress}%`, background: d.progress === 100 ? 'var(--success)' : 'var(--info)', transition: 'width 300ms ease' }} />
                        </div>
                        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg)' }}>{d.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="alarm-actions">
                        <button className="alarm-action-btn"><RefreshCw /></button>
                        <button className="alarm-action-btn"><Eye /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
          Mostrando {filtered.length} de {ALL_DEVICES.length} dispositivos
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="widget-action-btn" disabled style={{ opacity: 0.4 }}>1</button>
          <button className="widget-action-btn" style={{ width: 'auto', padding: '0 8px', minWidth: 32, background: 'var(--surface-hover)' }}>1</button>
        </div>
      </div>
    </>
  )
}
