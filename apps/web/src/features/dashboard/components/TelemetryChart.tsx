import { useEffect, useRef, useState } from 'react'
import { Activity, Maximize2, MoreVertical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '@/stores/themeStore'

const ranges = ['24h', '7d', '30d'] as const
type Range = (typeof ranges)[number]

const MAX_POINTS = 48

const initialTemp = [68, 69, 71, 72, 74, 75, 74, 73, 72, 73, 74, 76, 78, 79, 78, 77, 76, 77, 78, 79, 80, 81, 80, 79, 78, 77, 76, 75, 76, 77, 78, 79, 80, 81, 82, 82, 81, 80, 79, 78, 77, 76, 75, 74, 73, 72, 71, 70]
const initialPress = [6.1, 6.0, 6.2, 6.3, 6.2, 6.1, 6.0, 5.9, 6.0, 6.1, 6.2, 6.3, 6.4, 6.3, 6.2, 6.1, 6.0, 5.9, 6.0, 6.1, 6.2, 6.3, 6.4, 6.3, 6.2, 6.1, 6.0, 5.9, 6.0, 6.1, 6.2, 6.3, 6.4, 6.3, 6.2, 6.1, 6.0, 5.9, 6.0, 6.1, 6.2, 6.3, 6.4, 6.3, 6.2, 6.1, 6.0, 5.9]
const initialHumid = [45, 46, 47, 48, 49, 50, 51, 50, 49, 48, 47, 46, 45, 44, 45, 46, 47, 48, 49, 50, 51, 52, 51, 50, 49, 48, 47, 46, 45, 44, 45, 46, 47, 48, 49, 50, 51, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41, 40]

function normalize(data: number[], min: number, max: number) {
  return data.map(v => (v - min) / (max - min))
}

function drawChart(canvas: HTMLCanvasElement, temp: number[], press: number[], humid: number[]) {
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.parentElement!.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`

  const w = rect.width
  const h = rect.height
  const pad = { top: 20, right: 20, bottom: 30, left: 48 }
  const chartW = w - pad.left - pad.right
  const chartH = h - pad.top - pad.bottom

  const style = getComputedStyle(document.documentElement)
  const gridColor = style.getPropertyValue('--chart-grid').trim()
  const fgMuted = style.getPropertyValue('--fg-muted').trim()
  const accentColor = style.getPropertyValue('--accent').trim()
  const infoColor = style.getPropertyValue('--info').trim()
  const successColor = style.getPropertyValue('--success').trim()
  const chartFill = style.getPropertyValue('--chart-fill').trim()

  const tempNorm = normalize(temp, 60, 85)
  const pressNorm = normalize(press, 5.5, 6.5)
  const humidNorm = normalize(humid, 35, 55)

  ctx.strokeStyle = gridColor
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i
    ctx.beginPath()
    ctx.moveTo(pad.left, y)
    ctx.lineTo(pad.left + chartW, y)
    ctx.stroke()
  }

  ctx.fillStyle = fgMuted
  ctx.font = '10px "JetBrains Mono", monospace'
  ctx.textAlign = 'right'
  const yLabels = ['85°C', '78°C', '71°C', '64°C', '60°C']
  for (let i = 0; i < 5; i++) {
    const y = pad.top + (chartH / 4) * i
    ctx.fillText(yLabels[i], pad.left - 8, y + 3)
  }

  ctx.textAlign = 'center'
  const xLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
  for (let i = 0; i < xLabels.length; i++) {
    const x = pad.left + (chartW / (xLabels.length - 1)) * i
    ctx.fillText(xLabels[i], x, h - 8)
  }

  function drawLine(data: number[], color: string, fill: string | null) {
    ctx.beginPath()
    for (let i = 0; i < data.length; i++) {
      const x = pad.left + (chartW / (data.length - 1)) * i
      const y = pad.top + chartH - (data[i] * chartH)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()

    if (fill) {
      ctx.lineTo(pad.left + chartW, pad.top + chartH)
      ctx.lineTo(pad.left, pad.top + chartH)
      ctx.closePath()
      ctx.fillStyle = fill
      ctx.fill()
    }
  }

  drawLine(tempNorm, accentColor, chartFill)
  drawLine(pressNorm, infoColor, null)
  drawLine(humidNorm, successColor, null)

  const lastX = pad.left + chartW
  const lastY = pad.top + chartH - (tempNorm[tempNorm.length - 1] * chartH)
  ctx.beginPath()
  ctx.arc(lastX, lastY, 4, 0, Math.PI * 2)
  ctx.fillStyle = accentColor
  ctx.fill()
  ctx.beginPath()
  ctx.arc(lastX, lastY, 7, 0, Math.PI * 2)
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.3
  ctx.stroke()
  ctx.globalAlpha = 1
}

interface TelemetryPoint {
  temp: number
  press: number
  humid: number
}

export function TelemetryChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeRange, setActiveRange] = useState<Range>('24h')
  const [temp, setTemp] = useState<number[]>(initialTemp)
  const [press, setPress] = useState<number[]>(initialPress)
  const [humid, setHumid] = useState<number[]>(initialHumid)
  const [live, setLive] = useState(false)
  const { theme } = useThemeStore()
  const navigate = useNavigate()

  useEffect(() => {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${proto}//${window.location.host}${import.meta.env.BASE_URL}api/v1/ws/telemetry`
    let ws: WebSocket | null = null
    let retry: ReturnType<typeof setTimeout> | undefined

    function connect() {
      ws = new WebSocket(url)
      ws.onopen = () => setLive(true)
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg.type !== 'telemetry') return
          const d = msg.data as TelemetryPoint
          setTemp((prev) => [...prev, d.temp].slice(-MAX_POINTS))
          setPress((prev) => [...prev, d.press].slice(-MAX_POINTS))
          setHumid((prev) => [...prev, d.humid].slice(-MAX_POINTS))
        } catch { /* ignore malformed frames */ }
      }
      ws.onclose = () => {
        setLive(false)
        retry = setTimeout(connect, 3000)
      }
      ws.onerror = () => ws?.close()
    }

    connect()
    return () => {
      if (retry) clearTimeout(retry)
      ws?.close()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawChart(canvas, temp, press, humid)
  }, [temp, press, humid, activeRange, theme])

  useEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      drawChart(canvas, temp, press, humid)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [temp, press, humid, activeRange, theme])

  return (
    <div className="widget">
      <div className="widget-header">
        <div>
          <div className="widget-title"><Activity />Telemetria — Últimas 24h</div>
          <div className="widget-subtitle">
            Sensor de temperatura · Linha 3 · PLC-07
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                marginLeft: 10, fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                color: live ? 'var(--success)' : 'var(--fg-muted)', letterSpacing: '0.05em',
              }}
            >
              <span
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'currentColor',
                  animation: live ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
                }}
              />
              {live ? 'Ao vivo' : 'Conectando…'}
            </span>
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
          <button className="widget-action-btn" aria-label="Expandir" onClick={() => navigate('/app/telemetry')}>
            <Maximize2 />
          </button>
          <button className="widget-action-btn" aria-label="Mais opções" onClick={() => navigate('/app/telemetry')}>
            <MoreVertical />
          </button>
        </div>
      </div>
      <div className="telemetry-chart-wrap">
        <canvas ref={canvasRef} />
      </div>
      <div className="telemetry-chart-legend">
        <div className="telemetry-chart-legend-item">
          <span className="telemetry-chart-legend-dot" style={{ background: 'var(--accent)' }} />
          Temperatura (°C)
        </div>
        <div className="telemetry-chart-legend-item">
          <span className="telemetry-chart-legend-dot" style={{ background: 'var(--info)' }} />
          Pressão (bar)
        </div>
        <div className="telemetry-chart-legend-item">
          <span className="telemetry-chart-legend-dot" style={{ background: 'var(--success)' }} />
          Umidade (%)
        </div>
      </div>
    </div>
  )
}
