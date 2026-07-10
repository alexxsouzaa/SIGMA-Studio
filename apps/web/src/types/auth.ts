export interface User {
  id: number
  uuid: string
  username: string
  email: string
  display_name: string | null
  role_id: number
  current_organization_id: number
  active: boolean
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
}

export interface LoginRequest {
  username: string
  password: string
}
