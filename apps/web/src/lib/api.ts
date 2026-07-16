import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  User,
} from '@/types/auth'

const API_BASE = '/api/v1'

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
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
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  const text = await res.text()
  const json: ApiResponse<T> = text ? JSON.parse(text) : ({} as ApiResponse<T>)

  if (!res.ok || !json.success) {
    throw new Error(json.message || `Erro na requisição (${res.status})`)
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

export async function register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
  const res = await request<RegisterResponse>('/auth/register', {
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

export async function updateProfile(data: UpdateProfileRequest) {
  return request<User>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function changePassword(data: ChangePasswordRequest) {
  return request<void>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
