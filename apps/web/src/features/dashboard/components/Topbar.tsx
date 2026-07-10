import { Search, Bell, AlertTriangle, Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'

export function Topbar() {
  const { theme, toggle } = useThemeStore()

  return (
    <header className="topbar">
      <span className="topbar-title">Dashboard</span>

      <div className="topbar-search">
        <Search />
        <input
          type="text"
          placeholder="Buscar dispositivos, alarmes…"
          aria-label="Buscar"
        />
        <kbd>Ctrl+K</kbd>
      </div>

      <div className="topbar-divider" />

      <button className="topbar-btn" aria-label="Notificações">
        <Bell />
        <span className="topbar-btn-badge" />
      </button>

      <button className="topbar-btn" aria-label="Alertas">
        <AlertTriangle />
      </button>

      <div className="topbar-divider" />

      <button
        className="theme-toggle"
        onClick={toggle}
        aria-label="Alternar tema"
        style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', transition: 'background var(--transition)' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    </header>
  )
}
