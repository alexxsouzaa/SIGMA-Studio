import type { ApiResponse, LoginRequest, LoginResponse, User } from '@/types/auth'

const API_BASE = '/api/v1'

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('access_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  const json: ApiResponse<T> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Erro na requisição')
  }
  return json
}

export async function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const res = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  localStorage.setItem('access_token', res.data.access_token)
  localStorage.setItem('refresh_token', res.data.refresh_token)
  return res
}

export async function logout(): Promise<void> {
  try {
    await request('/auth/logout', { method: 'POST' })
  } finally {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}

export async function getMe() {
  return request<User>('/auth/me')
}
