import { useState, useRef, useEffect } from 'react'
import { SlidersHorizontal, RotateCcw, Check } from 'lucide-react'
import { WIDGET_DEFS, type WidgetKey, useDashboardWidgets } from '../lib/useDashboardWidgets'

export function DashboardWidgetSettings() {
  const { widgets, toggleWidget, resetWidgets } = useDashboardWidgets()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        className="widget-action-btn"
        style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => setOpen(!open)}
        aria-label="Personalizar dashboard"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <SlidersHorizontal size={16} style={{ color: 'var(--fg-muted)' }} />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="menu"
          aria-label="Widgets do dashboard"
          style={{
            position: 'absolute', right: 0, top: 44, zIndex: 60, width: 260,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
            padding: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px 10px' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Widgets do Dashboard</span>
            <button
              onClick={resetWidgets}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--fg-muted)' }}
            >
              <RotateCcw size={12} /> Restaurar
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {WIDGET_DEFS.map((w) => {
              const visible = widgets.includes(w.key as WidgetKey)
              return (
                <button
                  key={w.key}
                  onClick={() => toggleWidget(w.key as WidgetKey)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                    borderRadius: 'var(--radius-md)', fontSize: 13, textAlign: 'left',
                    color: 'var(--fg-secondary)', width: '100%',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{
                    width: 16, height: 16, borderRadius: 4, border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: visible ? 'var(--fg)' : 'transparent',
                  }}>
                    {visible && <Check size={12} style={{ color: 'var(--bg)' }} />}
                  </span>
                  {w.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
