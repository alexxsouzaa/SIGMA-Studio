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
  User,
  Settings,
  Search,
  Hexagon,
  Bell,
  Menu,
  Moon,
  Sun,
  LogOut,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'

const navSections = [
  {
    label: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
      { icon: Cpu, label: 'Dispositivos', path: '/app/devices', badge: '1.247' },
      { icon: BellRing, label: 'Alarmes', path: '/app/alarms', badge: '23' },
      { icon: Activity, label: 'Telemetria', path: '/app/telemetry' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { icon: Router, label: 'Gateways', path: '/app/gateways' },
      { icon: HardDrive, label: 'Firmware', path: '/app/firmware' },
      { icon: BrainCircuit, label: 'IA / TinyML', path: '/app/ia' },
      { icon: ScrollText, label: 'Logs', path: '/app/logs' },
    ],
  },
  {
    label: 'Conta',
    items: [
      { icon: User, label: 'Perfil', path: '/app/profile' },
      { icon: Settings, label: 'Configurações', path: '/app/settings' },
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

const NOTIFICATIONS = [
  { icon: AlertTriangle, iconClass: 'danger', title: 'ALM-014 — Alta vibração na Bomba BC-001', time: 'Há 12 min', unread: true },
  { icon: AlertCircle, iconClass: 'warning', title: 'GW-PlantaA — Latência acima do limite (180ms)', time: 'Há 34 min', unread: true },
  { icon: HardDrive, iconClass: 'info', title: 'Firmware v4.2.1 disponível para 6 dispositivos', time: 'Há 1 h', unread: true },
  { icon: CheckCircle, iconClass: 'success', title: 'IA — Modelo predição de falhas treinado com sucesso', time: 'Há 3 h', unread: false },
]

export function Sidebar() {
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
  const subtitle = user?.email || user?.username || ''

  return (
    <aside className="sidebar" id="sidebar">
      <Link to="/" className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Hexagon />
        </div>
        <span className="sidebar-brand-name">SIGMA Studio</span>
        <span className="sidebar-brand-version">v2.4</span>
      </Link>

      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.label + (item.badge ?? '')}
                  to={item.path}
                  className={`sidebar-item${isActive ? ' active' : ''}`}
                  aria-label={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="sidebar-item-badge">{item.badge}</span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/app/profile" className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{displayName}</div>
            <div className="sidebar-user-role">{subtitle}</div>
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

export function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggle: toggleTheme } = useThemeStore()
  const title = titleMap[location.pathname] ?? 'SIGMA Studio'
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const notifPanelRef = useRef<HTMLDivElement>(null)
  const notifBtnRef = useRef<HTMLButtonElement>(null)

  const unreadCount = notifications.filter((n) => n.unread).length

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
      if (e.key === 'Escape') setNotifOpen(false)
    }
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  function openMobileMenu() {
    const sidebar = document.getElementById('sidebar') as HTMLElement | null
    const overlay = document.getElementById('sidebar-overlay') as HTMLElement | null
    if (sidebar) sidebar.classList.add('mobile-open')
    if (overlay) overlay.classList.add('open')
  }

  function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar') as HTMLElement | null
    const overlay = document.getElementById('sidebar-overlay') as HTMLElement | null
    if (sidebar) sidebar.classList.remove('mobile-open')
    if (overlay) overlay.classList.remove('open')
  }

  return (
    <>
      <header className="topbar">
        <button className="topbar-menu-btn" onClick={openMobileMenu} aria-label="Abrir menu">
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
            {unreadCount > 0 && <span className="notif-dot" />}
          </button>
          <div ref={notifPanelRef} className={`notif-panel${notifOpen ? ' open' : ''}`} role="menu" aria-label="Notificações">
            <div className="notif-panel-header">
              <span className="notif-panel-title">Notificações</span>
              {unreadCount > 0 && <span className="notif-panel-badge">{unreadCount} novas</span>}
              <span className="notif-panel-mark" onClick={markAllRead}>Marcar como lidas</span>
            </div>
            <div className="notif-list">
              {notifications.map((n, i) => {
                const IconComp = n.icon
                return (
                  <div key={i} className={`notif-item${n.unread ? ' unread' : ''}`} role="menuitem">
                    <div className={`notif-item-icon ${n.iconClass}`}>
                      <IconComp />
                    </div>
                    <div className="notif-item-body">
                      <div className="notif-item-text" dangerouslySetInnerHTML={{ __html: n.title.replace('—', '&mdash;') }} />
                      <div className="notif-item-time"><Clock /> {n.time}</div>
                    </div>
                    {n.unread && <div className="notif-item-dot" />}
                  </div>
                )
              })}
            </div>
            <div className="notif-panel-footer">
              <Link to="/app/alarms" onClick={() => setNotifOpen(false)}>Ver todas as notificações</Link>
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
      <div className="sidebar-overlay" id="sidebar-overlay" onClick={closeMobileMenu} />
    </>
  )
}
