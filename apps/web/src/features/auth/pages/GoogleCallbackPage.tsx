import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LoadingSpinner } from '@/components/shared/StatusStates'

export function GoogleCallbackPage() {
  const navigate = useNavigate()
  const { loginWithTokens } = useAuthStore()

  useEffect(() => {
    ;(async () => {
      const ok = await loginWithTokens()
      navigate(ok ? '/app' : '/login', { replace: true })
    })()
  }, [navigate, loginWithTokens])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner />
    </div>
  )
}
