import { useState, useEffect, useCallback } from 'react'
import { getPreferences, updatePreferences, request } from '@/lib/api'
import type { Device } from '@/types/device'

interface UseApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
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
      const json = await request<T>(endpoint)
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

export { LoadingSpinner, ErrorState, EmptyState } from '@/components/shared/StatusStates'
