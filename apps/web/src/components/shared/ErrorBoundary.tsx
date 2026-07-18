import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div
          className="empty-state"
          style={{ padding: 60, gap: 12, height: '100vh', justifyContent: 'center' }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--danger)',
              textAlign: 'center',
            }}
          >
            Algo deu errado
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--fg-muted)',
              maxWidth: 360,
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            {this.state.error?.message ?? 'Erro inesperado ao renderizar a pagina.'}
          </div>
          <button
            className="widget-action-btn"
            style={{ padding: '6px 16px', width: 'auto' }}
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
          >
            Recarregar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
