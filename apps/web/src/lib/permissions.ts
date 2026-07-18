import type { User } from '@/types/auth'

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  engineer: 'Engenheiro',
  technician: 'Tecnico',
  operator: 'Operador',
  visitor: 'Visitante',
}

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user || !user.permissions) return false
  if (user.permissions.includes('*')) return true
  return user.permissions.includes(permission)
}

export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user || !user.permissions) return false
  if (user.permissions.includes('*')) return true
  return permissions.some((p) => user.permissions.includes(p))
}

export function getRoleLabel(roleName: string | null): string {
  if (!roleName) return 'Usuario'
  return ROLE_LABELS[roleName] ?? roleName
}