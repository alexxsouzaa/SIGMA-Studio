import { useMemo } from 'react'
import { ExternalLink, FlaskConical, Cpu, CheckCircle2, XCircle, Terminal, SearchX } from 'lucide-react'
import { useApi } from '@/lib/hooks'
import { LoadingSpinner, ErrorState } from '@/components/shared/StatusStates'
import type { Device } from '@/types/device'

const EMU_WEB_URL =
  (import.meta.env.VITE_EMU_WEB_URL as string | undefined) ?? 'http://localhost:5174'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Agora'
  if (mins < 60) return `${mins} min atras`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} h atras`
  const days = Math.floor(hours / 24)
  return `${days} dias atras`
}

export default function LabPage() {
  const { data: devices, isLoading, error, refetch } = useApi<Device[]>(
    '/devices/?limit=500&is_emulated=true',
    { refreshInterval: 15000 },
  )

  const total = useMemo(() => (devices ?? []).length, [devices])
  const onlineCount = useMemo(
    () => (devices ?? []).filter((d) => d.active).length,
    [devices],
  )
  const offlineCount = useMemo(
    () => (devices ?? []).filter((d) => !d.active).length,
    [devices],
  )

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          padding: '16px 18px',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)',
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div
            className="device-stat-icon info"
            style={{ flexShrink: 0 }}
          >
            <FlaskConical />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>
              Laboratório SIGMA Emu
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-secondary)', marginTop: 2 }}>
              Dispositivos simulados isolados da frota real (organização dedicada{' '}
              <span className="td-mono">sigma-emu</span>, flag{' '}
              <span className="td-mono">is_emulated</span>). Ideal para desenvolvimento e
              testes no SIGMA Studio.
            </div>
          </div>
        </div>
        <a
          className="btn-primary"
          href={`${EMU_WEB_URL}/fleet`}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: 'none', flexShrink: 0 }}
        >
          <ExternalLink size={16} /> Abrir no Emulador
        </a>
      </div>

      <div className="device-stats">
        {[
          { label: 'Total emulado', value: total, icon: Cpu, cls: 'total' },
          { label: 'Online', value: onlineCount, icon: CheckCircle2, cls: 'online' },
          { label: 'Offline', value: offlineCount, icon: XCircle, cls: 'offline' },
        ].map((s) => (
          <div key={s.label} className="device-stat r">
            <div className={`device-stat-icon ${s.cls}`}><s.icon /></div>
            <div><div className="device-stat-value">{s.value.toLocaleString('pt-BR')}</div><div className="device-stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {total === 0 ? (
        <div className="device-empty">
          <div className="device-empty-icon"><Terminal /></div>
          <div className="device-empty-title">Nenhum dispositivo emulado</div>
          <div className="device-empty-desc">
            Suba o core do SIGMA Emu com a integração ativa (EMU_SIGMA_API_URL, EMU_SIGMA_TOKEN
            e EMU_SIGMA_ORGANIZATION apontando para a organização &quot;SIGMA Emu — Laboratório&quot;).
            O auto-registro criará os dispositivos aqui automaticamente.
          </div>
        </div>
      ) : (
        <div className="device-grid-page">
          {devices!.map((d: Device, i: number) => (
            <div
              key={d.id}
              className="device-card r"
              style={{ transitionDelay: `${Math.min(i * 40, 400)}ms` }}
            >
              <div className="device-card-header">
                <div className="device-card-icon"><FlaskConical /></div>
                <span className={`device-card-status ${d.active ? 'online' : 'offline'}`}>
                  <span className="device-card-status-dot" />
                  {d.active ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="device-card-name">{d.name}</div>
              <div className="device-card-type">Emulador — {d.serial_number}</div>
              <div className="device-card-meta">
                <div className="device-card-row"><span className="device-card-row-label">Localizacao</span><span className="device-card-row-value">{d.location || '---'}</span></div>
                <div className="device-card-row"><span className="device-card-row-label">Firmware</span><span className="device-card-row-value">{d.firmware_version}</span></div>
                <div className="device-card-row"><span className="device-card-row-label">Ultima leitura</span><span className="device-card-row-value">{timeAgo(d.updated_at)}</span></div>
              </div>
              <div className="device-card-tags">
                <span className="device-tag">Emulador</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 12.5, color: 'var(--fg-muted)' }}>
        <SearchX size={14} style={{ opacity: 0.7 }} />
        Atualiza automaticamente a cada 15 s. Configure <span className="td-mono">VITE_EMU_WEB_URL</span> no
        frontend do Studio para apontar a UI do emulador (padrão http://localhost:5174).
      </div>
    </>
  )
}
