import { useState, useRef, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Cpu,
  BellRing,
  Activity,
  Router,
  HardDrive,
  BrainCircuit,
  ScrollText,
  Users as UsersIcon,
  User,
  Settings,
  Search,
  Bell,
  Menu,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { APP_VERSION_LABEL } from '@/version'
import { hasPermission, getRoleLabel } from '@/lib/permissions'

const navSections = [
  {
    label: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/app', permission: 'dashboard' },
      { icon: Cpu, label: 'Dispositivos', path: '/app/devices', permission: 'devices' },
      { icon: BellRing, label: 'Alarmes', path: '/app/alarms', permission: 'alarms' },
      { icon: Activity, label: 'Telemetria', path: '/app/telemetry', permission: 'telemetry' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { icon: Router, label: 'Gateways', path: '/app/gateways', permission: 'gateways' },
      { icon: HardDrive, label: 'Firmware', path: '/app/firmware', permission: 'firmware' },
      { icon: BrainCircuit, label: 'IA / TinyML', path: '/app/ia', permission: 'ia' },
      { icon: ScrollText, label: 'Logs', path: '/app/logs', permission: 'logs' },
    ],
  },
  {
    label: 'Conta',
    items: [
      { icon: User, label: 'Perfil', path: '/app/profile', permission: 'profile' },
      { icon: Settings, label: 'Configurações', path: '/app/settings', permission: 'settings' },
    ],
  },
  {
    label: 'Administracao',
    items: [
      { icon: UsersIcon, label: 'Usuarios', path: '/app/users', permission: 'users' },
    ],
  },
]

const titleMap: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/devices': 'Dispositivos',
  '/app/alarms': 'Alarmes',
  '/app/telemetry': 'Telemetria',
  '/app/gateways': 'Gateways',
  '/app/firmware': 'Firmware / OTA',
  '/app/ia': 'IA / TinyML',
  '/app/logs': 'Logs',
  '/app/search': 'Busca',
  '/app/profile': 'Meu Perfil',
  '/app/settings': 'Configurações',
}

export function Sidebar({ mobileOpen = false }: { mobileOpen?: boolean }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const displayName = user?.display_name || user?.username || 'Usuário'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const roleLabel = getRoleLabel(user?.role_name ?? null)

  return (
    <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <Link to="/app" className="sidebar-brand" style={{ justifyContent: 'center', gap: 6 }}>
        <img className="sidebar-brand-logo theme-logo-dark" src="/logo-light.png" alt="SIGMA Studio" />
        <img className="sidebar-brand-logo theme-logo-light" src="/logo-dark.png" alt="SIGMA Studio" />
        <span className="sidebar-brand-version">{APP_VERSION_LABEL}</span>
      </Link>

      <nav className="sidebar-nav">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => hasPermission(user, item.permission)
          )
          if (visibleItems.length === 0) return null
          return (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {visibleItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`sidebar-item${isActive ? ' active' : ''}`}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <Link to="/app/profile" className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{displayName}</div>
            <div className="sidebar-user-role">{roleLabel}</div>
          </div>
        </Link>
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}

export function Topbar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggle: toggleTheme } = useThemeStore()
  const title = titleMap[location.pathname] ?? 'SIGMA Studio'
  const [notifOpen, setNotifOpen] = useState(false)
  const notifPanelRef = useRef<HTMLDivElement>(null)
  const notifBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        notifPanelRef.current &&
        !notifPanelRef.current.contains(e.target as Node) &&
        notifBtnRef.current &&
        !notifBtnRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setNotifOpen(false)
        setMobileOpen(false)
      }
    }
    function handleResize() {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKey)
    window.addEventListener('resize', handleResize)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      <header className="topbar">
        <button className="topbar-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
          <Menu />
        </button>
        <span className="topbar-title">{title}</span>

        <div className="topbar-search">
          <Search />
          <input
            type="text"
            placeholder="Buscar dispositivos, alarmes…"
            aria-label="Buscar"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                navigate(`/app/search?q=${encodeURIComponent((e.target as HTMLInputElement).value.trim())}`)
              }
            }}
          />
          <kbd>/</kbd>
        </div>

        <div className="notif-wrapper">
          <button
            ref={notifBtnRef}
            className="topbar-btn"
            aria-label="Notificações"
            aria-haspopup="true"
            aria-expanded={notifOpen}
            onClick={(e) => { e.stopPropagation(); setNotifOpen(!notifOpen) }}
          >
            <Bell />
          </button>
          <div ref={notifPanelRef} className={`notif-panel${notifOpen ? ' open' : ''}`} role="menu" aria-label="Notificações">
            <div className="notif-panel-header">
              <span className="notif-panel-title">Notificações</span>
            </div>
            <div className="notif-list">
              <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: 13, color: 'var(--fg-muted)' }}>
                Nenhuma notificação
              </div>
            </div>
          </div>
        </div>

        <button
          className="topbar-btn"
          onClick={toggleTheme}
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <Moon /> : <Sun />}
        </button>
      </header>
      <div className={`sidebar-overlay${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} />
    </>
  )
}
