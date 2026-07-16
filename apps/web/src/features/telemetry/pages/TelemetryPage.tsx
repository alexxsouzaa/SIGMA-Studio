import { useState } from 'react'
import { Download } from 'lucide-react'
import { EmptyState } from '@/lib/hooks'

// TODO: connect to GET /api/v1/telemetry when endpoint exists

const DEVICES: string[] = []

export default function TelemetryPage() {
  const [range, setRange] = useState('6h')
  const [selectedDevice, setSelectedDevice] = useState('')

  return (
    <>
      <div className="widget">
        <div className="widget-header">
          <div className="widget-title">
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              style={{
                background: 'var(--surface)', color: 'var(--fg)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '6px 12px', fontSize: 13,
              }}
            >
              <option value="">Selecione um dispositivo...</option>
              {DEVICES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <div className="telemetry-chart-tabs">
              {['1h', '6h', '24h', '7d', '30d'].map((r) => (
                <button
                  key={r}
                  className={`telemetry-chart-tab${range === r ? ' active' : ''}`}
                  onClick={() => setRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
            <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />
            <button className="widget-action-btn" style={{ padding: '0 12px', width: 'auto' }}><Download /> Exportar</button>
          </div>
        </div>
      </div>

      <div className="widget">
        <div className="widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
          <EmptyState
            title="Dados de telemetria indisponiveis"
            description="Selecione um dispositivo para visualizar"
          />
        </div>
      </div>

      <div className="widget">
        <div className="widget-header">
          <div className="widget-title">Leituras Recentes</div>
        </div>
        <div className="widget-body" style={{ padding: 0 }}>
          <EmptyState title="Nenhuma leitura disponível" />
        </div>
      </div>
    </>
  )
}
