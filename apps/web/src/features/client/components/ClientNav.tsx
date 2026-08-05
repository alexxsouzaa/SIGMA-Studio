import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'

export default function ClientNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="landing-nav" aria-label="Navegação principal">
      <div className="landing-nav-inner">
        <Link
          to="/"
          className="landing-nav-brand"
          aria-label="Página inicial SIGMA Studio"
        >
          <img className="theme-logo-dark" src={`${import.meta.env.BASE_URL}logo-light.png`} alt="SIGMA Studio" style={{ height: 14, width: 'auto' }} />
          <img className="theme-logo-light" src={`${import.meta.env.BASE_URL}logo-dark.png`} alt="SIGMA Studio" style={{ height: 14, width: 'auto' }} />
        </Link>
        <div className={`landing-nav-links${menuOpen ? ' open' : ''}`}>
          <Link to="/" className="landing-nav-link">
            Site institucional
          </Link>
          <Link to="/app" className="landing-nav-cta">
            Acessar painel
          </Link>
        </div>
        <button
          type="button"
          className="landing-nav-mobile-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
        >
          <Menu />
        </button>
      </div>
    </nav>
  )
}
