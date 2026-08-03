import { useEffect, useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeft, Copy, Check, Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { APP_VERSION } from '@/version'

export default function NotFoundPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { toggle } = useThemeStore()
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const revealTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const elements = document.querySelectorAll<HTMLElement>('.r')
    if (!elements.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((el) => el.classList.add('v'))
      return
    }
    let idx = 0
    revealTimer.current = setInterval(() => {
      if (idx < elements.length) {
        elements[idx].classList.add('v')
        idx++
      } else {
        clearInterval(revealTimer.current)
      }
    }, 80)
    return () => clearInterval(revealTimer.current)
  }, [mounted])

  function handleCopy() {
    const url = window.location.href
    const done = () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(done, () => {
        const ta = document.createElement('textarea')
        ta.value = url
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        try { document.execCommand('copy'); done() } catch { /* ignore */ }
        document.body.removeChild(ta)
      })
    }
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/app')
    }
  }

  if (!mounted) return null

  return (
    <div className="error-page">
      <a href="#main-content" className="skip-link">Pular para conteúdo principal</a>

      <header className="error-header">
        <div className="error-brand">
          <img className="theme-logo-dark" src="/logo-light.png" alt="SIGMA Studio" style={{ height: 20 }} />
          <img className="theme-logo-light" src="/logo-dark.png" alt="SIGMA Studio" style={{ height: 20 }} />
          <span className="error-version">v{APP_VERSION}</span>
        </div>
        <div style={{ flex: 1 }} />
        <button className="error-theme-btn" onClick={toggle} aria-label="Alternar tema">
          <Moon className="theme-icon-dark" />
          <Sun className="theme-icon-light" />
        </button>
      </header>

      <main className="error-main" id="main-content">
        <p className="error-eyebrow r">Erro · HTTP 404</p>

        <div className="error-code r" role="img" aria-label="Erro 404">
          4<span className="error-code-accent">0</span>4
        </div>
        <h1 className="error-title r">Página não encontrada</h1>
        <p className="error-desc r">O endereço solicitado não existe, foi movido ou está temporariamente indisponível.</p>

        <div className="error-path r">
          <span className="error-path-text">GET {location.pathname || '/'} · 404</span>
          <button className={`error-path-copy${copied ? ' copied' : ''}`} onClick={handleCopy} aria-label="Copiar endereço">
            {copied ? <Check /> : <Copy />}
          </button>
        </div>

        <div className="error-actions r">
          <Link to="/app" className="error-btn-primary"><LayoutDashboard /> Ir para o Dashboard</Link>
          <button className="error-btn-ghost" onClick={handleBack}><ArrowLeft /> Voltar</button>
        </div>
      </main>

      <footer className="error-footer">
        <span className="error-footer-meta">SIGMA Studio · HTTP 404</span>
        <div className="error-footer-links">
          <Link to="/app">Dashboard</Link>
          <Link to="/app/devices">Dispositivos</Link>
          <Link to="/app/search">Busca</Link>
        </div>
      </footer>
    </div>
  )
}
