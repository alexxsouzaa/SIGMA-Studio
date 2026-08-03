export interface Gateway {
  id: number
  uuid: string
  organization_id: number
  name: string
  protocol: string
  endpoint: string | null
  status: string
  devices_count: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface GatewayCreate {
  organization_id: number
  name: string
  protocol: string
  endpoint?: string | null
  status?: string
}

export interface GatewayUpdate {
  name?: string
  protocol?: string
  endpoint?: string | null
  status?: string
  devices_count?: number
  active?: boolean
}
