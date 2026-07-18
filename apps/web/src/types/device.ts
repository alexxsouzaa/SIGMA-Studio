export interface Device {
  id: number
  uuid: string
  organization_id: number
  site_id: number | null
  project_id: number | null
  name: string
  serial_number: string
  firmware_version: string
  location: string | null
  active: boolean
  created_at: string
  updated_at: string
}
