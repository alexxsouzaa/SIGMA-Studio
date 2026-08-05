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

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (res.status === 401) {
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
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getGoogleLoginUrl() {
  return `${API_BASE}/auth/google/login`
}

export async function register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function logout(): Promise<void> {
  try {
    await request('/auth/logout', { method: 'POST' })
  } catch {
    return
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

export async function getPreferences(): Promise<ApiResponse<Record<string, unknown>>> {
  return request<Record<string, unknown>>('/auth/me/preferences')
}

export async function updatePreferences(preferences: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return request<Record<string, unknown>>('/auth/me/preferences', {
    method: 'PATCH',
    body: JSON.stringify({ preferences }),
  })
}
