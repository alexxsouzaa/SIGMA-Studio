import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LoadingSpinner } from '@/components/shared/StatusStates'

export function GoogleCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithTokens } = useAuthStore()

  useEffect(() => {
    const access = params.get('access_token')
    const refresh = params.get('refresh_token')
    const error = params.get('error')

    if (error || !access || !refresh) {
      navigate('/login', { replace: true })
      return
    }

    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    loginWithTokens()
    navigate('/app', { replace: true })
  }, [params, navigate, loginWithTokens])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner />
    </div>
  )
}
