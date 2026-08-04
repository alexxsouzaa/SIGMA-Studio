import { useState, useEffect, useRef } from 'react'
import { Cpu, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useDevices } from '@/lib/hooks'

const MAX_POINTS = 60

interface LivePoint {
  temp: number
  press: number
  humid: number
}

export default function TelemetryPage() {
  const { data: devices } = useDevices()
  const [range, setRange] = useState('6h')
  const [selectedDevice, setSelectedDevice] = useState('')
  const [live, setLive] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  const [temp, setTemp] = useState<number[]>(Array.from({ length: MAX_POINTS }, () => 30))
  const [cpu, setCpu] = useState<number[]>(Array.from({ length: MAX_POINTS }, () => 65))
  const [mem, setMem] = useState<number[]>(Array.from({ length: MAX_POINTS }, () => 4.2))
  const [net, setNet] = useState<number[]>(Array.from({ length: MAX_POINTS }, () => 124))

  useEffect(() => {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const base = import.meta.env.BASE_URL || '/'
    const url = `${proto}//${window.location.host}${base}api/v1/ws/telemetry`
    let retry: ReturnType<typeof setTimeout> | undefined

    function connect() {
      const ws = new WebSocket(url)
      wsRef.current = ws
      ws.onopen = () => setLive(true)
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg.type !== 'telemetry') return
          const d = msg.data as LivePoint
          setTemp((prev) => [...prev, d.temp].slice(-MAX_POINTS))
          setCpu((prev) => [...prev, Math.min(100, Math.max(0, 50 + d.temp * 0.5))].slice(-MAX_POINTS))
          setMem((prev) => [...prev, Math.round((3 + (d.humid / 100) * 2) * 10) / 10].slice(-MAX_POINTS))
          setNet((prev) => [...prev, Math.round(100 + d.press * 10)].slice(-MAX_POINTS))
        } catch { /* ignore */ }
      }
      ws.onclose = () => {
        setLive(false)
        retry = setTimeout(connect, 3000)
      }
      ws.onerror = () => ws.close()
    }

    connect()
    return () => {
      if (retry) clearTimeout(retry)
      wsRef.current?.close()
    }
  }, [])

  const summaries = [
    { label: 'Temperatura', value: temp[temp.length - 1], unit: '°C', trend: 'up', trendVal: '+2.1%', min: Math.min(...temp), max: Math.max(...temp), color: 'var(--info)', data: temp },
    { label: 'CPU', value: cpu[cpu.length - 1], unit: '%', trend: 'up', trendVal: '+5.3%', min: Math.min(...cpu), max: Math.max(...cpu), color: 'var(--warning)', data: cpu },
    { label: 'Memória', value: mem[mem.length - 1], unit: 'GB', trend: 'neutral', trendVal: '0.0%', min: Math.min(...mem), max: Math.max(...mem), color: 'var(--success)', data: mem, extra: '8 GB total' },
    { label: 'Rede', value: net[net.length - 1], unit: 'ms', trend: 'down', trendVal: '-1.8%', min: Math.min(...net), max: Math.max(...net), color: 'var(--success)', data: net },
  ]

  const ThresholdIcon = ({ dir }: { dir: string }) => {
    if (dir === 'up') return <TrendingUp />
    if (dir === 'down') return <TrendingDown />
    return <Minus />
  }

  const tableRows = Array.from({ length: 10 }, (_, i) => {
    const idx = Math.max(0, temp.length - 1 - i * 6)
    const t = temp[idx] ?? temp[0]
    const status = t > 75 ? 'critical' : t > 70 ? 'warning' : 'normal'
    return {
      time: new Date(Date.now() - i * 3600000).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      temp: t, cpu: cpu[idx] ?? cpu[0], mem: mem[idx] ?? mem[0], net: net[idx] ?? net[0], status,
    }
  })

  const tMin = Math.min(...temp), tMax = Math.max(...temp), tRange = (tMax - tMin) || 1
  const mainChartPts = temp.map((v, i) => `${i * (800 / (MAX_POINTS - 1))},${220 - ((v - tMin) / tRange) * 200}`).join(' ')
  const critY = 220 - ((80 - tMin) / tRange) * 200
  const warnY = 220 - ((75 - tMin) / tRange) * 200

  const deviceOptions = (devices ?? []).map((d) => `${d.name} (${d.serial_number})`)

  return (
    <>
      <div className="telemetry-controls">
        <div className="telemetry-device-select">
          <Cpu />
          <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)} aria-label="Selecionar dispositivo">
            <option value="">Selecione um dispositivo...</option>
            {deviceOptions.length > 0
              ? deviceOptions.map((d) => <option key={d} value={d}>{d}</option>)
              : <option value="DEV-001">DEV-001 — Sensor Temperatura A1</option>
            }
          </select>
        </div>
        <div className="time-range" role="radiogroup" aria-label="Intervalo de tempo">
          {['1h', '6h', '24h', '7d', '30d'].map((r) => (
            <button key={r} className={`time-range-btn${range === r ? ' active' : ''}`} role="radio" aria-checked={range === r} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
        <div className="telemetry-actions">
          <button className="btn-ghost"><Download /> Exportar</button>
          <button className={`btn-primary${live ? '' : ' is-live'}`} style={live ? { background: 'var(--success)' } : undefined}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', display: 'inline-block', marginRight: 4, animation: live ? 'pulse-dot 1.5s ease-in-out infinite' : 'none' }} />
            {live ? 'Ao vivo' : 'Conectando…'}
          </button>
        </div>
      </div>

      <div className="telemetry-summary">
        {summaries.map((s) => (
          <div key={s.label} className="tele-card">
            <div className="tele-card-header">
              <span className="tele-card-label">{s.label}</span>
              <span className={`tele-card-trend ${s.trend}`}><ThresholdIcon dir={s.trend} />{s.trendVal}</span>
            </div>
            <div className="tele-card-value">{s.value.toLocaleString('pt-BR')}<span className="tele-card-unit">{s.unit}</span></div>
            <div className="tele-card-chart">
              <svg viewBox="0 0 200 40" preserveAspectRatio="none">
                <polyline points={miniPolyline(s.data)} fill="none" stroke={s.color} strokeWidth={1.5} strokeLinecap="round" />
              </svg>
            </div>
            <div className="tele-card-footer">
              <span>Mín: {s.min.toLocaleString('pt-BR')}{s.unit}</span>
              <span>{s.extra ? `${s.extra}` : `Máx: ${s.max.toLocaleString('pt-BR')}${s.unit}`}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="main-chart">
        <div className="main-chart-header">
          <span className="main-chart-title">Temperatura — Últimas {range === '1h' ? '1 hora' : range === '6h' ? '6 horas' : range === '24h' ? '24 horas' : range === '7d' ? '7 dias' : '30 dias'}</span>
          <div className="main-chart-legend">
            <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--info)' }} />Temperatura</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--danger)' }} />Limite crítico</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--warning)' }} />Limite de alerta</span>
          </div>
        </div>
        <div className="main-chart-area" role="img" aria-label="Gráfico de temperatura">
          <svg viewBox="0 0 800 240" preserveAspectRatio="none">
            <line x1="0" y1={critY} x2="800" y2={critY} stroke="var(--danger)" strokeWidth={1} strokeDasharray="6 4" opacity={0.6} />
            <line x1="0" y1={warnY} x2="800" y2={warnY} stroke="var(--warning)" strokeWidth={1} strokeDasharray="6 4" opacity={0.6} />
            <polyline points={mainChartPts} fill="none" stroke="var(--info)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="main-chart-xaxis">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date(Date.now() - (6 - i) * 3600000)
            return <span key={i}>{String(d.getHours()).padStart(2, '0')}:{String(d.getMinutes()).padStart(2, '0')}</span>
          })}
        </div>
      </div>

      <div className="data-table-wrap">
        <div className="data-table-section-header">
          <span className="data-table-section-title">Leituras recentes</span>
          <span className="data-table-count">{tableRows.length} registros</span>
        </div>
        <div className="data-table-scroll">
          <table className="data-table" aria-label="Leituras de telemetria recentes">
            <thead><tr><th>Data/Hora</th><th>Temperatura</th><th>CPU</th><th>Memória</th><th>Rede</th><th>Status</th></tr></thead>
            <tbody>
              {tableRows.map((r, i) => (
                <tr key={i}>
                  <td>{r.time}</td>
                  <td>{r.temp.toLocaleString('pt-BR')}°C</td>
                  <td>{r.cpu.toLocaleString('pt-BR')}%</td>
                  <td>{r.mem.toLocaleString('pt-BR')} GB</td>
                  <td>{r.net.toLocaleString('pt-BR')} ms</td>
                  <td><span className={`td-status ${r.status}`}>{r.status === 'normal' ? 'Normal' : r.status === 'warning' ? 'Alerta' : 'Crítico'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function miniPolyline(data: number[]): string {
  const min = Math.min(...data); const max = Math.max(...data); const range = max - min || 1
  return data.map((v, i) => `${i * (200 / (data.length - 1))},${38 - ((v - min) / range) * 36}`).join(' ')
}
