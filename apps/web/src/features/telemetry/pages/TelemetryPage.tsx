import { useState, useEffect, useRef } from 'react'
import { Cpu, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useDevices } from '@/lib/hooks'
import { exportCSV } from '@/lib/export'
import { EmptyState } from '@/components/shared/StatusStates'
import type { Device } from '@/types/device'

const MAX_POINTS = 60

interface LivePoint {
  temp: number | null
  vibration_x: number | null
  vibration_y: number | null
  vibration_z: number | null
  rms: number | null
}

function minOf(a: number[]) { return a.length ? Math.min(...a) : 0 }
function maxOf(a: number[]) { return a.length ? Math.max(...a) : 0 }
function lastOf(a: number[]) { return a.length ? a[a.length - 1] : null }

function pctChange(data: number[]): string | null {
  if (data.length < 2 || !data[0]) return null
  const pct = ((data[data.length - 1] - data[0]) / data[0]) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
}

export default function TelemetryPage() {
  const { data: devices } = useDevices()
  const [selectedDevice, setSelectedDevice] = useState('')
  const [live, setLive] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  const [temp, setTemp] = useState<number[]>([])
  const [vibx, setVibx] = useState<number[]>([])
  const [viby, setViby] = useState<number[]>([])
  const [vibz, setVibz] = useState<number[]>([])
  const [rms, setRms] = useState<number[]>([])

  useEffect(() => {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const base = import.meta.env.BASE_URL || '/'
    const deviceParam = selectedDevice ? `?device_id=${encodeURIComponent(selectedDevice)}` : ''
    const url = `${proto}//${window.location.host}${base}api/v1/ws/telemetry${deviceParam}`
    let retry: ReturnType<typeof setTimeout> | undefined

    function connect() {
      const ws = new WebSocket(url)
      wsRef.current = ws
      setUnauthorized(false)
      ws.onopen = () => setLive(true)
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg.type !== 'telemetry') return
          const d = msg.data as LivePoint
          const t = d.temp, vx = d.vibration_x, vy = d.vibration_y, vz = d.vibration_z, rm = d.rms
          if (t != null && !Number.isNaN(t)) setTemp((prev) => [...prev, t].slice(-MAX_POINTS))
          if (vx != null && !Number.isNaN(vx)) setVibx((prev) => [...prev, vx].slice(-MAX_POINTS))
          if (vy != null && !Number.isNaN(vy)) setViby((prev) => [...prev, vy].slice(-MAX_POINTS))
          if (vz != null && !Number.isNaN(vz)) setVibz((prev) => [...prev, vz].slice(-MAX_POINTS))
          if (rm != null && !Number.isNaN(rm)) setRms((prev) => [...prev, rm].slice(-MAX_POINTS))
        } catch { /* ignore malformed frames */ }
      }
      ws.onclose = (ev) => {
        setLive(false)
        if (ev.code === 4401) {
          setUnauthorized(true)
          return
        }
        retry = setTimeout(connect, 3000)
      }
      ws.onerror = () => ws.close()
    }

    connect()
    return () => {
      if (retry) clearTimeout(retry)
      wsRef.current?.close()
    }
  }, [selectedDevice])

  const hasData = temp.length > 0

  const summaries = [
    { label: 'Temperatura', value: lastOf(temp), unit: '°C', data: temp, color: 'var(--info)' },
    { label: 'Vibração X', value: lastOf(vibx), unit: 'g', data: vibx, color: 'var(--warning)' },
    { label: 'Vibração Y', value: lastOf(viby), unit: 'g', data: viby, color: 'var(--success)' },
    { label: 'RMS', value: lastOf(rms), unit: 'g', data: rms, color: 'var(--accent)' },
  ]

  const ThresholdIcon = ({ dir }: { dir: string }) => {
    if (dir === 'up') return <TrendingUp />
    if (dir === 'down') return <TrendingDown />
    return <Minus />
  }

  const tableRows = Array.from({ length: 10 }, (_, i) => {
    const idx = Math.max(0, temp.length - 1 - i * 6)
    const t = temp[idx]
    return {
      time: new Date(Date.now() - i * 12000).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      temp: t, vibx: vibx[idx], viby: viby[idx], vibz: vibz[idx], rms: rms[idx],
      status: t == null ? 'normal' : t > 75 ? 'critical' : t > 70 ? 'warning' : 'normal',
    }
  })

  const tMin = minOf(temp), tMax = maxOf(temp), tRange = (tMax - tMin) || 1
  const mainChartPts = temp.map((v, i) => `${i * (800 / (MAX_POINTS - 1))},${220 - ((v - tMin) / tRange) * 200}`).join(' ')
  const critY = 220 - ((80 - tMin) / tRange) * 200
  const warnY = 220 - ((75 - tMin) / tRange) * 200

  function handleExport() {
    const headers = ['Data/Hora', 'Temperatura (°C)', 'Vibração X (g)', 'Vibração Y (g)', 'Vibração Z (g)', 'RMS (g)']
    const rows = temp.map((v, i) => [
      new Date(Date.now() - (temp.length - 1 - i) * 2000).toLocaleString('pt-BR'),
      v, vibx[i], viby[i], vibz[i], rms[i],
    ])
    exportCSV(`telemetria-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
  }

  const devicesList = devices ?? []

  return (
    <>
      <div className="telemetry-controls">
        <div className="telemetry-device-select">
          <Cpu />
          <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)} aria-label="Selecionar dispositivo">
            <option value="">Todos os dispositivos</option>
            {devicesList.map((d: Device) => (
              <option key={d.id} value={d.id}>{d.name} ({d.serial_number})</option>
            ))}
          </select>
        </div>
        <div className="telemetry-actions">
          <button className="btn-ghost" onClick={handleExport} disabled={!hasData}><Download /> Exportar</button>
          <button
            className={`btn-primary${live ? '' : ' is-live'}`}
            style={live ? { background: 'var(--success)' } : undefined}
            aria-label={unauthorized ? 'Nao autenticado' : live ? 'Transmissao ao vivo' : 'Conectando'}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', display: 'inline-block', marginRight: 4, animation: live ? 'pulse-dot 1.5s ease-in-out infinite' : 'none' }} />
            {unauthorized ? 'Não autenticado' : live ? 'Ao vivo' : 'Conectando…'}
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="widget" style={{ padding: '40px 0' }}>
          <EmptyState
            icon={<Cpu />}
            title={unauthorized ? 'Sem permissão para telemetria' : 'Aguardando dados de telemetria'}
            description={
              unauthorized
                ? 'A sessão expirou ou o token é inválido. Faça login novamente.'
                : 'Nenhuma leitura de sensor recebida ainda. As leituras aparecerão aqui em tempo real.'
            }
          />
        </div>
      ) : (
        <>
          <div className="telemetry-summary">
            {summaries.map((s) => {
              const trend = pctChange(s.data)
              const dir = trend == null ? 'neutral' : trend.startsWith('+') ? 'up' : trend.startsWith('-') ? 'down' : 'neutral'
              const sMin = minOf(s.data), sMax = maxOf(s.data)
              return (
                <div key={s.label} className="tele-card">
                  <div className="tele-card-header">
                    <span className="tele-card-label">{s.label}</span>
                    <span className={`tele-card-trend ${dir}`}><ThresholdIcon dir={dir} />{trend ?? '—'}</span>
                  </div>
                  <div className="tele-card-value">{s.value != null ? s.value.toLocaleString('pt-BR') : '—'}<span className="tele-card-unit">{s.unit}</span></div>
                  <div className="tele-card-chart">
                    {s.data.length > 1 && (
                      <svg viewBox="0 0 200 40" preserveAspectRatio="none">
                        <polyline points={miniPolyline(s.data)} fill="none" stroke={s.color} strokeWidth={1.5} strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <div className="tele-card-footer">
                    <span>Mín: {sMin.toLocaleString('pt-BR')}{s.unit}</span>
                    <span>Máx: {sMax.toLocaleString('pt-BR')}{s.unit}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="main-chart">
            <div className="main-chart-header">
              <span className="main-chart-title">Temperatura — Tempo real</span>
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
                const d = new Date(Date.now() - (6 - i) * 12000)
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
                <thead><tr><th>Data/Hora</th><th>Temperatura</th><th>Vib. X</th><th>Vib. Y</th><th>Vib. Z</th><th>RMS</th><th>Status</th></tr></thead>
                <tbody>
                  {tableRows.map((r, i) => (
                    <tr key={i}>
                      <td>{r.time}</td>
                      <td>{r.temp != null ? `${r.temp.toLocaleString('pt-BR')}°C` : '—'}</td>
                      <td>{r.vibx != null ? r.vibx.toLocaleString('pt-BR') : '—'}</td>
                      <td>{r.viby != null ? r.viby.toLocaleString('pt-BR') : '—'}</td>
                      <td>{r.vibz != null ? r.vibz.toLocaleString('pt-BR') : '—'}</td>
                      <td>{r.rms != null ? r.rms.toLocaleString('pt-BR') : '—'}</td>
                      <td><span className={`td-status ${r.status}`}>{r.status === 'normal' ? 'Normal' : r.status === 'warning' ? 'Alerta' : 'Crítico'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function miniPolyline(data: number[]): string {
  const min = Math.min(...data); const max = Math.max(...data); const range = max - min || 1
  return data.map((v, i) => `${i * (200 / (data.length - 1))},${38 - ((v - min) / range) * 36}`).join(' ')
}
