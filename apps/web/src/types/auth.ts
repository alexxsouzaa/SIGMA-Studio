export interface User {
  id: number
  uuid: string
  username: string
  email: string
  display_name: string | null
  role_id: number
  role_name: string | null
  permissions: string[]
  current_organization_id: number
  active: boolean
  avatar_url: string | null
  google_id: string | null
  created_at: string
}

export interface Organization {
  id: number
  uuid: string
  name: string
  slug: string
  active: boolean
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
  organizations: Organization[]
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp?: string
  request_id?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  display_name: string
}

export interface UpdateProfileRequest {
  display_name?: string | null
  email?: string | null
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

export interface RegisterResponse extends LoginResponse {}
