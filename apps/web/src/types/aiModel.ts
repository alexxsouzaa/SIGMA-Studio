export interface AIModel {
  id: number
  uuid: string
  name: string
  type: string
  framework: string
  status: string
  accuracy: number
  latency: number
  f1: number
  device: string | null
  size: string | null
  description: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface AIModelCreate {
  name: string
  type?: string
  framework?: string
  accuracy?: number
  latency?: number
  f1?: number
  device?: string | null
  size?: string | null
  description?: string | null
}
