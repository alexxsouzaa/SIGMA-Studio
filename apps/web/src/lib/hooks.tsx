import { useState, useEffect, useCallback } from 'react'
import { getPreferences, updatePreferences } from '@/lib/api'

interface UseApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

interface Device {
  id: number
  uuid: string
  organization_id: number
  site_id: number | null
  project_id: number | null
  name: string
  serial_number: string
  firmware_version: string
  location: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export function useApi<T>(endpoint: string | null) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: !!endpoint,
    error: null,
  })

  const fetchData = useCallback(async () => {
    if (!endpoint) {
      setState({ data: null, isLoading: false, error: null })
      return
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = 'Bearer ' + token
      const res = await fetch('/api/v1' + endpoint, { headers })
      if (res.status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return
      }
      const text = await res.text()
      const json = text ? JSON.parse(text) : ({} as { success?: boolean; data?: T; message?: string })
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Erro (' + res.status + ')')
      }
      setState({ data: json.data ?? null, isLoading: false, error: null })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados'
      setState({ data: null, isLoading: false, error: message })
    }
  }, [endpoint])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}

export function useDevices() {
  return useApi<Device[]>('/devices/')
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Record<string, unknown>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await getPreferences()
      setPrefs(res.data ?? {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar preferencias')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const save = useCallback(async (newPrefs: Record<string, unknown>) => {
    setError(null)
    try {
      await updatePreferences(newPrefs)
      setPrefs(newPrefs)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar preferencias')
      return false
    }
  }, [])

  return { preferences: prefs, isLoading, error, save, refetch: load }
}

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
