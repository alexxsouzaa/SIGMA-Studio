import { useState } from 'react'
import { Users as UsersIcon, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/hooks'
import { LoadingSpinner, ErrorState, EmptyState } from '@/components/shared/StatusStates'
import { getRoleLabel } from '@/lib/permissions'

interface Role {
  id: number
  name: string
  description: string | null
}

interface UserItem {
  id: number
  uuid: string
  username: string
  email: string
  display_name: string | null
  role_id: number | null
  role_name: string | null
  permissions: string[]
  active: boolean
  created_at: string
}

export default function UsersPage() {
  const { data: users, isLoading, error, refetch } = useApi<UserItem[]>('/users/')
  const { data: roles } = useApi<Role[]>('/users/roles')
  const [saving, setSaving] = useState<number | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function changeRole(userId: number, roleId: number) {
    setSaving(userId)
    setSaveError(null)
    try {
      const token = localStorage.getItem('access_token')
      const res = await fetch(`/api/v1/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role_id: roleId }),
      })
      if (!res.ok) throw new Error('Erro ao alterar cargo')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      refetch()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setSaving(null)
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!users || users.length === 0) {
    return <EmptyState icon={<UsersIcon />} title="Nenhum usuario encontrado" description="Crie uma conta para comecar." />
  }

  return (
    <>
      <div className="widget">
        <div className="widget-header">
          <div className="widget-title">
            <UsersIcon size={16} style={{ color: 'var(--fg-muted)' }} />
            Gerenciar Usuarios
          </div>
          <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
            {users.length} usuarios
          </span>
        </div>
        <div className="widget-body" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="alarms-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Cargo</th>
                <th>Status</th>
                <th>Criado em</th>
                <th>Alterar cargo</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.display_name || u.username}</div>
                    <div className="alarm-device">@{u.username}</div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>{u.email}</td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--radius-sm)',
                      background: u.role_name === 'admin' ? 'var(--danger-muted)' :
                        u.role_name === 'engineer' ? 'var(--info-muted)' :
                        u.role_name === 'technician' ? 'var(--warning-muted)' :
                        u.role_name === 'operator' ? 'var(--success-muted)' :
                        'var(--surface-hover)',
                      color: u.role_name === 'admin' ? 'var(--danger)' :
                        u.role_name === 'engineer' ? 'var(--info)' :
                        u.role_name === 'technician' ? 'var(--warning)' :
                        u.role_name === 'operator' ? 'var(--success)' :
                        'var(--fg-muted)',
                    }}>
                      {getRoleLabel(u.role_name)}
                    </span>
                  </td>
                  <td>
                    <span className="alarm-severity low" style={{ fontSize: 11 }}>
                      <span className="alarm-severity-dot" style={{ background: u.active ? 'var(--success)' : 'var(--danger)' }} />
                      {u.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="alarm-time">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                  <td>
                    {roles && roles.length > 0 ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <select
                          className="login-input"
                          value={u.role_id ?? ''}
                          onChange={(e) => changeRole(u.id, Number(e.target.value))}
                          style={{ height: 30, fontSize: 12, width: 130 }}
                          disabled={saving === u.id}
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>{r.description || r.name}</option>
                          ))}
                        </select>
                        {saving === u.id && <Loader2 className="login-spinner" style={{ display: 'block', animation: 'spin 600ms linear infinite', width: 14, height: 14, border: '2px solid var(--border)', borderTopColor: 'var(--fg)', borderRadius: '50%' }} />}
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>---</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {saveError && (
        <div style={{ color: 'var(--danger)', fontSize: 13 }}>{saveError}</div>
      )}

      {saved && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--success)', color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500, zIndex: 200, boxShadow: 'var(--shadow-lg)' }}>
          Cargo atualizado com sucesso
        </div>
      )}
    </>
  )
}
