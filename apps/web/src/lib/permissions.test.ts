import { describe, expect, it } from 'vitest'
import { getRoleLabel, hasAnyPermission, hasPermission, ROLE_LABELS } from './permissions'
import type { User } from '@/types/auth'

function makeUser(permissions: string[], roleName: string | null = 'admin'): User {
  return {
    id: 1,
    uuid: 'u1',
    username: 'admin',
    email: 'admin@sigma.io',
    display_name: null,
    role_id: 1,
    role_name: roleName,
    permissions,
    current_organization_id: 1,
    active: true,
    avatar_url: null,
    google_id: null,
    created_at: '2024-01-01T00:00:00Z',
  }
}

describe('hasPermission', () => {
  it('retorna false para usuário nulo', () => {
    expect(hasPermission(null, 'devices')).toBe(false)
  })

  it('retorna false sem a permissão', () => {
    expect(hasPermission(makeUser(['dashboard']), 'devices')).toBe(false)
  })

  it('retorna true com a permissão exata', () => {
    expect(hasPermission(makeUser(['dashboard', 'devices']), 'devices')).toBe(true)
  })

  it('retorna true com wildcard *', () => {
    expect(hasPermission(makeUser(['*']), 'devices')).toBe(true)
  })
})

describe('hasAnyPermission', () => {
  it('retorna true se possuir qualquer uma', () => {
    expect(hasAnyPermission(makeUser(['dashboard']), ['devices', 'dashboard'])).toBe(true)
  })

  it('retorna false sem nenhuma permissão', () => {
    expect(hasAnyPermission(makeUser(['dashboard']), ['devices', 'alarms'])).toBe(false)
  })

  it('retorna false para usuário nulo', () => {
    expect(hasAnyPermission(null, ['devices'])).toBe(false)
  })

  it('retorna true com wildcard *', () => {
    expect(hasAnyPermission(makeUser(['*']), ['devices'])).toBe(true)
  })
})

describe('getRoleLabel', () => {
  it('retorna label conhecida', () => {
    expect(getRoleLabel('admin')).toBe('Administrador')
    expect(getRoleLabel('engineer')).toBe('Engenheiro')
  })

  it('retorna o próprio nome para roles desconhecidas', () => {
    expect(getRoleLabel('auditor')).toBe('auditor')
  })

  it('retorna Usuario para nulo', () => {
    expect(getRoleLabel(null)).toBe('Usuario')
  })
})

describe('ROLE_LABELS', () => {
  it('cobre as roles oficiais do RBAC', () => {
    expect(Object.keys(ROLE_LABELS)).toEqual(['admin', 'engineer', 'technician', 'operator', 'visitor'])
  })
})
