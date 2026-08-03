import { create } from 'zustand'
import type { User, RegisterRequest, UpdateProfileRequest, ChangePasswordRequest } from '@/types/auth'
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe, updateProfile as apiUpdateProfile, changePassword as apiChangePassword } from '@/lib/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  register: (data: RegisterRequest) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  loginWithTokens: () => Promise<boolean>
  clearError: () => void
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>
  changePassword: (data: ChangePasswordRequest) => Promise<boolean>
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
      const message = err instanceof Error ? err.message : 'Erro ao conectar ao servidor'
      set({ isLoading: false, error: message })
      return false
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null })
    try {
      const res = await apiRegister(data)
      set({
        user: res.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao conectar ao servidor'
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

  loginWithTokens: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await getMe()
      set({ user: res.data, isAuthenticated: true, isLoading: false, error: null })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao conectar ao servidor'
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      set({ user: null, isAuthenticated: false, isLoading: false, error: message })
      return false
    }
  },

  clearError: () => set({ error: null }),

  updateProfile: async (data: UpdateProfileRequest) => {
    set({ isLoading: true, error: null })
    try {
      const res = await apiUpdateProfile(data)
      set({ user: res.data, isLoading: false })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar perfil'
      set({ isLoading: false, error: message })
      return false
    }
  },

  changePassword: async (data: ChangePasswordRequest) => {
    set({ isLoading: true, error: null })
    try {
      await apiChangePassword(data)
      set({ isLoading: false })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao alterar senha'
      set({ isLoading: false, error: message })
      return false
    }
  },
}))
