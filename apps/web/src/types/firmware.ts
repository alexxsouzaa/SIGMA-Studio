export interface Firmware {
  id: number
  uuid: string
  version: string
  description: string | null
  released_at: string | null
  active: boolean
  created_at: string
}

export interface DeviceFirmwareStatus {
  device_id: number
  name: string
  current: string
  latest: string
  status: string
  progress: number
  date: string | null
}
