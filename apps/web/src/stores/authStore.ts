import { create } from 'zustand'
import type { User } from '@/types/auth'
import { login as apiLogin, logout as apiLogout, getMe } from '@/lib/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await apiLogin({ username, password })
      set({
        user: res.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      return true
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao conectar ao servidor'
      set({ isLoading: false, error: message })
      return false
    }
  },

  logout: async () => {
    await apiLogout()
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      set({ user: null, isAuthenticated: false })
      return
    }
    set({ isLoading: true })
    try {
      const res = await getMe()
      set({ user: res.data, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
