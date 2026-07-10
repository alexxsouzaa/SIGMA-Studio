import {
  LayoutDashboard,
  Cpu,
  BellRing,
  Activity,
  GitBranch,
  Router,
  HardDrive,
  Brain,
  ScrollText,
  Settings,
  Hexagon,
} from 'lucide-react'

const navSections = [
  {
    label: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', badge: undefined, active: true },
      { icon: Cpu, label: 'Dispositivos', badge: '1.247' },
      { icon: BellRing, label: 'Alarmes', badge: '23' },
      { icon: Activity, label: 'Telemetria' },
    ],
  },
  {
    label: 'Operação',
    items: [
      { icon: GitBranch, label: 'Automação' },
      { icon: Router, label: 'Gateways' },
      { icon: HardDrive, label: 'Firmware / OTA' },
    ],
  },
  {
    label: 'Inteligência',
    items: [
      { icon: Brain, label: 'IA / TinyML' },
      { icon: ScrollText, label: 'Logs' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { icon: Settings, label: 'Configurações' },
    ],
  },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Hexagon />
        </div>
        <span className="sidebar-brand-name">SIGMA Studio</span>
        <span className="sidebar-brand-version">v2.4</span>
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => (
              <button
                key={item.label}
                className={`sidebar-item${item.active ? ' active' : ''}`}
                aria-label={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="sidebar-item-badge">{item.badge}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">CR</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Carlos Ribeiro</div>
            <div className="sidebar-user-role">Supervisor</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
