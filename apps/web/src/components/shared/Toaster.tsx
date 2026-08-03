import { BellRing, X } from 'lucide-react'
import { useToasts, dismissToast } from '@/lib/toastStore'

const SEV_COLOR: Record<string, string> = {
  critical: 'var(--danger)',
  error: 'var(--danger)',
  warning: 'var(--warning)',
  info: 'var(--info)',
  low: 'var(--success)',
}

export function Toaster() {
  const toasts = useToasts()

  return (
    <div
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 300,
        display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderLeft: `3px solid ${SEV_COLOR[t.level] ?? 'var(--info)'}`,
            borderRadius: 'var(--radius-md)', padding: '12px 14px',
            boxShadow: 'var(--shadow-lg)', fontSize: 13, color: 'var(--fg)',
            animation: 'fadeUp 250ms ease both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BellRing size={14} style={{ color: SEV_COLOR[t.level] ?? 'var(--info)', flexShrink: 0 }} />
            <span style={{ fontWeight: 600, flex: 1 }}>{t.title}</span>
            <button
              onClick={() => dismissToast(t.id)}
              aria-label="Fechar"
              style={{
                width: 22, height: 22, display: 'flex', alignItems: 'center',
                justifyContent: 'center', borderRadius: 'var(--radius-sm)',
                color: 'var(--fg-muted)', flexShrink: 0,
              }}
            >
              <X size={14} />
            </button>
          </div>
          {t.description && (
            <div style={{ marginTop: 4, fontSize: 12, color: 'var(--fg-secondary)', lineHeight: 1.5 }}>
              {t.description}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
