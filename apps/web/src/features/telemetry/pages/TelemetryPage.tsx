import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Download } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

function generateTimeSeries(base: number, variance: number, points: number) {
  const data = []
  for (let i = 0; i < points; i++) {
    const sin = Math.sin((i / points) * Math.PI * 2)
    const noise = (Math.sin(i * 0.7 + ((i * 13) % 100) * 0.1) * 0.5)
    const val = base + sin * variance * 0.5 + noise * variance * 0.3
    data.push(+(val).toFixed(2))
  }
  return data
}

const tempData = generateTimeSeries(68, 12, 60)
const cpuData = generateTimeSeries(45, 20, 60)
const memData = generateTimeSeries(3.8, 1.2, 60)
const netData = generateTimeSeries(120, 40, 60)

const DEVICES = ['DEV-003 - Controladora PLC Central', 'DEV-001 - PLC-07', 'DEV-005 - Gateway-M04', 'DEV-008 - RTU-Festo']

export default function TelemetryPage() {
  const [range, setRange] = useState('6h')
  const [selectedDevice, setSelectedDevice] = useState(DEVICES[0])

  const chartData = useMemo(() => {
    const hours = range === '1h' ? 1 : range === '6h' ? 6 : range === '24h' ? 24 : range === '7d' ? 168 : 720
    const points = range === '1h' ? 60 : range === '6h' ? 60 : range === '24h' ? 48 : range === '7d' ? 56 : 60
    const data = []
    const now = new Date()
    for (let i = points - 1; i >= 0; i--) {
      const t = new Date(now.getTime() - (i * hours * 60 * 60 * 1000) / points)
      data.push({
        time: t.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        temperatura: +(tempData[i % tempData.length] + (Math.random() * 2 - 1)).toFixed(1),
        cpu: +(cpuData[i % cpuData.length] + (Math.random() * 3 - 1.5)).toFixed(1),
        memoria: +(memData[i % memData.length] + (Math.random() * 0.2 - 0.1)).toFixed(1),
        rede: +(netData[i % netData.length] + (Math.random() * 10 - 5)).toFixed(0),
      })
    }
    return data
  }, [range])

  const summaries = [
    { label: 'Temperatura', value: '68.4°C', trend: 'up', trendValue: '+2.3°C', min: '64.1°C', max: '78.9°C' },
    { label: 'CPU', value: '47.2%', trend: 'up', trendValue: '+3.1%', min: '28.4%', max: '82.1%' },
    { label: 'Memória', value: '3.9 GB', trend: 'neutral', trendValue: 'de 8 GB', min: '3.2 GB', max: '5.1 GB' },
    { label: 'Rede', value: '118 ms', trend: 'down', trendValue: '-12 ms', min: '82 ms', max: '174 ms' },
  ]

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

      <div className="kpi-grid">
        {summaries.map((s) => (
          <div className="kpi-card" key={s.label}>
            <div className="kpi-card-header">
              <span className="kpi-card-label">{s.label}</span>
              <span className={`kpi-card-trend ${s.trend === 'up' ? 'down' : s.trend === 'down' ? 'up' : ''}`}>
                {s.trend === 'up' ? <TrendingUp /> : s.trend === 'down' ? <TrendingDown /> : ''}
                {s.trendValue}
              </span>
            </div>
            <div className="kpi-card-value">{s.value}</div>
            <div className="kpi-card-footer">
              Min: {s.min} · Max: {s.max}
            </div>
          </div>
        ))}
      </div>

      <div className="widget">
        <div className="widget-body">
          <div className="telemetry-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-line)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--chart-line)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--fg-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--fg-muted)' }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 12,
                    color: 'var(--fg)',
                  }}
                />
                <Area type="monotone" dataKey="temperatura" stroke="var(--chart-line)" fill="url(#tempGrad)" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="telemetry-chart-legend">
            <div className="telemetry-chart-legend-item">
              <span className="telemetry-chart-legend-dot" style={{ background: 'var(--chart-line)' }} />
              Temperatura
            </div>
          </div>
        </div>
      </div>

      <div className="widget">
        <div className="widget-header">
          <div className="widget-title">Leituras Recentes</div>
        </div>
        <div className="widget-body" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="alarms-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Temperatura</th>
                <th>CPU</th>
                <th>Memória</th>
                <th>Rede</th>
              </tr>
            </thead>
            <tbody>
              {chartData.slice(-10).reverse().map((d, i) => (
                <tr key={i}>
                  <td className="alarm-time">{d.time}</td>
                  <td className="alarm-device">{d.temperatura}°C</td>
                  <td className="alarm-device">{d.cpu}%</td>
                  <td className="alarm-device">{d.memoria} GB</td>
                  <td className="alarm-device">{d.rede} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
