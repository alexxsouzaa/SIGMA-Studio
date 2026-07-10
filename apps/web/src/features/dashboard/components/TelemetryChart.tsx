import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Activity, Maximize2, MoreVertical } from 'lucide-react'

const ranges = ['24h', '7d', '30d'] as const
type Range = (typeof ranges)[number]

const rawData = Array.from({ length: 48 }, (_, i) => {
  const tempBase = 68 + Math.sin(i / 6) * 6 + Math.sin(i / 3) * 2
  return {
    time: `${String(Math.floor((i * 30) / 60)).padStart(2, '0')}:${String((i * 30) % 60).padStart(2, '0')}`,
    temperatura: Math.round(tempBase * 10) / 10,
    pressao: Math.round((6.1 + Math.sin(i / 8) * 0.25) * 100) / 100,
    umidade: Math.round((46 + Math.sin(i / 5) * 4 + Math.sin(i / 2) * 1.5) * 10) / 10,
  }
})

export function TelemetryChart() {
  const [activeRange, setActiveRange] = useState<Range>('24h')

  return (
    <div className="widget">
      <div className="widget-header">
        <div>
          <div className="widget-title">
            <Activity />
            Telemetria — Últimas 24h
          </div>
          <div className="widget-subtitle">
            Sensor de temperatura · Linha 3 · PLC-07
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
          <button className="widget-action-btn" aria-label="Mais opções">
            <MoreVertical />
          </button>
        </div>
      </div>

      <div style={{ padding: '8px 0 0 0' }}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={rawData} margin={{ top: 16, right: 16, bottom: 24, left: 8 }}>
            <defs>
              <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.12} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray=""
              stroke="var(--chart-grid)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--fg-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
              ticks={['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']}
              interval={0}
            />
            <YAxis
              tick={{ fill: 'var(--fg-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
              domain={[60, 85]}
              ticks={[60, 65, 70, 75, 80, 85]}
              tickFormatter={(v: number) => `${v}°C`}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 12,
                color: 'var(--fg)',
              }}
            />
            <Area
              type="monotone"
              dataKey="temperatura"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#tempFill)"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--accent)', strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="pressao"
              stroke="var(--info)"
              strokeWidth={2}
              fill="none"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="umidade"
              stroke="var(--success)"
              strokeWidth={2}
              fill="none"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
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
          Pressão (bar)
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
