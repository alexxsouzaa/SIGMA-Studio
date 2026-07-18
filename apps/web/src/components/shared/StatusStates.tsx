export function LoadingSpinner() {
  return (
    <div className="empty-state">
      <div
        className="login-spinner"
        style={{
          display: 'block',
          animation: 'spin 600ms linear infinite',
          width: 24,
          height: 24,
          border: '2px solid var(--border)',
          borderTopColor: 'var(--fg)',
          borderRadius: '50%',
        }}
      />
      <div className="empty-state-text">Carregando...</div>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="empty-state" style={{ gap: 12 }}>
      <div style={{ fontSize: 13, color: 'var(--danger)', textAlign: 'center', maxWidth: 320 }}>{message}</div>
      {onRetry && (
        <button className="widget-action-btn" onClick={onRetry} style={{ padding: '6px 16px', width: 'auto' }}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon, title, description }: { icon?: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="empty-state" style={{ gap: 8 }}>
      {icon && <div style={{ opacity: 0.4 }}>{icon}</div>}
      <div className="empty-state-text">{title}</div>
      {description && (
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', maxWidth: 320, textAlign: 'center', lineHeight: 1.5 }}>
          {description}
        </div>
      )}
    </div>
  )
}
