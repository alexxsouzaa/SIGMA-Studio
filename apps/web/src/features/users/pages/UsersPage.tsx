import { useState, useMemo } from 'react'
import { Users as UsersIcon, UserCheck, UserX, Shield, UserPlus, Pencil, X, Check, KeyRound, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useApi } from '@/lib/hooks'
import { LoadingSpinner, ErrorState } from '@/components/shared/StatusStates'
import { getRoleLabel } from '@/lib/permissions'
import { useAuthStore } from '@/stores/authStore'
import { request } from '@/lib/api'

interface UserItem { id: number; uuid: string; username: string; email: string; display_name: string | null; role_id: number | null; role_name: string | null; permissions: string[]; active: boolean; last_login: string | null; created_at: string }
interface Role { id: number; name: string; description: string | null }
type PanelMode = 'edit' | 'create'

const FILTERS = [
  { label: 'Todos', value: 'all', color: 'var(--fg-secondary)' },
  { label: 'Ativos', value: 'active', color: 'var(--success)' },
  { label: 'Inativos', value: 'inactive', color: 'var(--danger)' },
  { label: 'Administradores', value: 'admin', color: 'var(--info)' },
  { label: 'Engenheiros', value: 'engineer', color: 'var(--warning)' },
  { label: 'Tecnicos', value: 'technician', color: 'var(--warning)' },
  { label: 'Operadores', value: 'operator', color: 'var(--success)' },
  { label: 'Visitantes', value: 'visitor', color: 'var(--fg-muted)' },
]

const PER_PAGE = 5

function initials(name: string) { return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) }
function roleStyle(roleName: string | null) { const r = roleName ?? ''; const isAdmin = r === 'admin'; const isEng = r === 'engineer' || r === 'technician'; return { color: isAdmin ? 'var(--info)' : isEng ? 'var(--warning)' : 'var(--success)', bg: isAdmin ? 'var(--info-muted)' : isEng ? 'var(--warning-muted)' : 'var(--success-muted)' } }
function relativeTime(dateStr: string | null): string { if (!dateStr) return 'Nunca'; const diff = Date.now() - new Date(dateStr).getTime(); const mins = Math.floor(diff / 60000); if (mins < 1) return 'Agora'; if (mins < 60) return `${mins} min atras`; const hours = Math.floor(mins / 60); if (hours < 24) return `${hours} h atras`; const days = Math.floor(hours / 24); return days < 30 ? `${days} dias atras` : new Date(dateStr).toLocaleDateString('pt-BR') }

export default function UsersPage() {
  const { user: currentUser } = useAuthStore()
  const { data: users, isLoading, error, refetch } = useApi<UserItem[]>('/users/')
  const { data: roles } = useApi<Role[]>('/users/roles')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [panelMode, setPanelMode] = useState<PanelMode>('edit')
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [editForm, setEditForm] = useState({ display_name: '', email: '', role_id: 0, password: '', active: true })
  const [passwordError, setPasswordError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const filtered = useMemo(() => (users ?? [])
    .filter((u) => { if (filter === 'all') return true; if (filter === 'active') return u.active; if (filter === 'inactive') return !u.active; return u.role_name === filter })
    .filter((u) => { if (!search.trim()) return true; const q = search.toLowerCase(); return (u.display_name ?? u.username).toLowerCase().includes(q) || u.email.toLowerCase().includes(q) }),
    [users, filter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const stats = { total: users?.length ?? 0, active: users?.filter((u) => u.active).length ?? 0, inactive: users?.filter((u) => !u.active).length ?? 0, admins: users?.filter((u) => u.role_name === 'admin').length ?? 0 }

  function openEdit(user: UserItem) { setPanelMode('edit'); setEditingUser(user); setEditForm({ display_name: user.display_name ?? user.username, email: user.email, role_id: user.role_id ?? 0, password: '', active: user.active }); setConfirmDelete(false) }
  function openCreate() { setPanelMode('create'); setEditingUser(null); setEditForm({ display_name: '', email: '', role_id: roles?.[0]?.id ?? 0, password: '', active: true }); setConfirmDelete(false); setPasswordError('') }
  function closePanel() { setEditingUser(null); setConfirmDelete(false); setPanelMode('edit') }

  async function handleSave() {
    setSaving(true)
    setPasswordError('')
    try {
      if (panelMode === 'create') {
        if (!editForm.password || editForm.password.length < 6) {
          setPasswordError('A senha deve ter no minimo 6 caracteres')
          setSaving(false)
          return
        }
        await request('/users/', { method: 'POST', body: JSON.stringify({ username: editForm.email.split('@')[0] || 'user', email: editForm.email, password: editForm.password, display_name: editForm.display_name, role_id: editForm.role_id || null }) })
        showToast('Usuario criado com sucesso')
      } else if (editingUser) {
        if (editForm.role_id !== editingUser.role_id && editForm.role_id > 0) await request(`/users/${editingUser.id}/role`, { method: 'PUT', body: JSON.stringify({ role_id: editForm.role_id }) })
        if (editForm.display_name !== (editingUser.display_name ?? editingUser.username) || editForm.email !== editingUser.email || editForm.active !== editingUser.active)
          await request(`/users/${editingUser.id}`, { method: 'PATCH', body: JSON.stringify({ display_name: editForm.display_name, email: editForm.email, active: editForm.active }) })
        showToast('Usuario salvo com sucesso')
      }
      closePanel(); refetch()
    } catch (err) { showToast(err instanceof Error ? err.message : 'Erro ao salvar usuario') } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!editingUser) return; setSaving(true)
    try { await request(`/users/${editingUser.id}`, { method: 'DELETE' }); showToast('Usuario excluido com sucesso'); closePanel(); refetch() } catch (err) { showToast(err instanceof Error ? err.message : 'Erro ao excluir usuario') } finally { setSaving(false) }
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0 4px' }}>
        <div><div style={{ fontSize: 16, fontWeight: 600 }}>Gerenciar Usuarios</div><div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 1 }}>{stats.total} usuarios registrados na plataforma</div></div>
        <button className="widget-action-btn" onClick={openCreate} style={{ padding: '7px 14px', width: 'auto', background: 'var(--fg)', color: 'var(--bg)' }}><UserPlus size={16} /> Novo Usuario</button>
      </div>

      <div className="kpi-grid">
        {[{ label: 'Total', value: stats.total, icon: UsersIcon, className: 'accent' }, { label: 'Ativos', value: stats.active, icon: UserCheck, className: 'success' }, { label: 'Inativos', value: stats.inactive, icon: UserX, className: 'danger' }, { label: 'Administradores', value: stats.admins, icon: Shield, className: 'info' }].map((s) => (
          <div className="kpi-card" key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><div className={`kpi-card-icon ${s.className}`} style={{ width: 40, height: 40 }}><s.icon /></div><div><div className="kpi-card-value" style={{ fontSize: 20 }}>{s.value}</div><div style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>{s.label}</div></div></div>
        ))}
      </div>

      <div className="widget">
        <div className="widget-header" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map((f) => { const count = (users ?? []).filter((u) => { if (f.value === 'all') return true; if (f.value === 'active') return u.active; if (f.value === 'inactive') return !u.active; return u.role_name === f.value }).length; if (count === 0 && f.value !== 'all') return null; return (<button key={f.value} className={`filter-chip${filter === f.value ? ' active' : ''}`} onClick={() => { setFilter(filter === f.value ? 'all' : f.value); setPage(1) }}><span className="filter-chip-dot" style={{ background: f.color }} />{f.label}<span className="filter-chip-count">{count}</span></button>) })}
          </div>
          <div className="topbar-search" style={{ width: 220 }}><Search /><input type="text" placeholder="Buscar usuario..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} /></div>
        </div>
        <div className="widget-body" style={{ padding: 0, overflowX: 'auto' }}>
          {paginated.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 32px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><UsersIcon size={28} style={{ color: 'var(--fg-muted)' }} /></div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Nenhum usuario encontrado</div>
              <div style={{ fontSize: 13, color: 'var(--fg-muted)', maxWidth: 320, lineHeight: 1.6 }}>Tente alterar o filtro ou os termos da busca.</div>
            </div>
          ) : (
            <>
              <table className="alarms-table" style={{ width: '100%' }}>
                <thead><tr><th>Usuario</th><th>Email</th><th>Funcao</th><th>Status</th><th>Ultimo acesso</th><th style={{ width: 80 }}></th></tr></thead>
                <tbody>{paginated.map((u) => { const isMe = u.id === currentUser?.id; const rs = roleStyle(u.role_name); return (<tr key={u.id} style={{ cursor: isMe ? 'default' : 'pointer' }} onClick={() => !isMe && openEdit(u)}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0, color: rs.color, background: rs.bg }}>{initials(u.display_name ?? u.username)}</div><div><div style={{ fontWeight: 500, color: 'var(--fg)' }}>{u.display_name ?? u.username}{isMe && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, background: 'var(--success-muted)', color: 'var(--success)' }}>Voce</span>}</div><div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{u.email}</div></div></div></td>
                  <td className="alarm-device" style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>{u.email}</td>
                  <td><span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 'var(--radius-sm)', color: rs.color, background: rs.bg }}>{getRoleLabel(u.role_name)}</span></td>
                  <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 'var(--radius-sm)', background: u.active ? 'var(--success-muted)' : 'var(--danger-muted)', color: u.active ? 'var(--success)' : 'var(--danger)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: u.active ? 'var(--success)' : 'var(--danger)', flexShrink: 0 }} />{u.active ? 'Ativo' : 'Inativo'}</span></td>
                  <td className="alarm-time">{relativeTime(u.last_login)}</td>
                  <td><div className="alarm-actions">{!isMe && <button className="alarm-action-btn" onClick={(e) => { e.stopPropagation(); openEdit(u) }}><Pencil /></button>}</div></td>
                </tr>)})}</tbody>
              </table>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>Mostrando {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} de {filtered.length} usuarios</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="widget-action-btn" disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ opacity: page <= 1 ? 0.4 : 1, width: 32, height: 32 }}><ChevronLeft /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (<button key={p} className="widget-action-btn" onClick={() => setPage(p)} style={{ width: 32, height: 32, background: p === page ? 'var(--surface-hover)' : '', fontWeight: p === page ? 600 : 400 }}>{p}</button>))}
                  <button className="widget-action-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ opacity: page >= totalPages ? 0.4 : 1, width: 32, height: 32, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}><ChevronRight /></button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {editingUser !== null && (
        <>
          <div className="detail-overlay" onClick={closePanel} />
          <div className="detail-panel open" style={{ zIndex: 51, width: 480 }}>
            <div className="detail-header"><h3>{panelMode === 'create' ? 'Novo Usuario' : (editingUser?.display_name ?? editingUser?.username ?? '')}</h3><button onClick={closePanel}><X /></button></div>
            <div className="detail-body">
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 600, color: 'var(--fg-secondary)', background: 'var(--surface)', border: '2px solid var(--border)' }}>{panelMode === 'create' ? '?' : initials(editForm.display_name)}</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>{panelMode === 'create' ? 'Novo Usuario' : editForm.display_name}</div>
                <div style={{ fontSize: 13, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>{panelMode === 'create' ? editForm.email || '---' : editingUser?.email}</div>
              </div>
              <div style={{ height: 1, background: 'var(--border)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><label className="login-label">Nome completo</label><input className="login-input" value={editForm.display_name} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} style={{ height: 36 }} /></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><label className="login-label">Email</label><input className="login-input" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} style={{ height: 36 }} /></div>
              {panelMode === 'create' && <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><label className="login-label">Senha <span style={{ color: 'var(--danger)' }}>*</span></label><input className="login-input" type="password" value={editForm.password} onChange={(e) => { setEditForm({ ...editForm, password: e.target.value }); setPasswordError('') }} placeholder="Minimo 6 caracteres" style={{ height: 36 }} />{passwordError && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{passwordError}</span>}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><label className="login-label">Funcao</label><select className="login-input" value={editForm.role_id} onChange={(e) => setEditForm({ ...editForm, role_id: Number(e.target.value) })} style={{ height: 36 }}>{roles?.map((r) => <option key={r.id} value={r.id}>{r.description || r.name}</option>)}</select></div>
              {panelMode === 'edit' && <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><label className="login-label">Status</label><select className="login-input" value={editForm.active ? 'active' : 'inactive'} onChange={(e) => setEditForm({ ...editForm, active: e.target.value === 'active' })} style={{ height: 36 }}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></div>}
              <div style={{ height: 1, background: 'var(--border)' }} />
              <button className="widget-action-btn" onClick={handleSave} disabled={saving} style={{ padding: '8px 18px', width: '100%', justifyContent: 'center', background: 'var(--fg)', color: 'var(--bg)' }}>{saving ? 'Salvando...' : <><Check size={16} /> Salvar alteracoes</>}</button>
              {panelMode === 'edit' && !confirmDelete && <button className="widget-action-btn" onClick={() => setConfirmDelete(true)} style={{ padding: '8px 18px', width: '100%', justifyContent: 'center', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)' }}>Excluir usuario</button>}
              {panelMode === 'edit' && confirmDelete && <div style={{ display: 'flex', gap: 8 }}><button className="widget-action-btn" onClick={handleDelete} disabled={saving} style={{ flex: 1, padding: '8px', justifyContent: 'center', background: 'var(--danger)', color: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>{saving ? 'Excluindo...' : 'Confirmar exclusao'}</button><button className="widget-action-btn" onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '8px', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>Cancelar</button></div>}
              {panelMode === 'edit' && <button className="widget-action-btn" onClick={() => showToast('Link de redefinicao enviado por email')} style={{ padding: '8px 18px', width: '100%', justifyContent: 'center', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)' }}><KeyRound size={16} /> Redefinir senha</button>}
            </div>
          </div>
        </>
      )}

      {toast && <div className="toast" style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--fg)', color: 'var(--bg)', padding: '10px 18px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, boxShadow: 'var(--shadow-md)', zIndex: 200, transition: 'opacity 200ms ease' }}><Check size={16} /> {toast}</div>}
    </>
  )
}
